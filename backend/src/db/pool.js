/**
 * db/pool.js
 * ---------------------------------------------------------------------
 * DreamNexa runs on MySQL. Every controller/util in this codebase was
 * written against Postgres-flavoured SQL text (`$1, $2, ...` params,
 * `RETURNING`, `ON CONFLICT`, `ILIKE`, `::type` casts, `now()`). Rather
 * than rewriting ~30 call sites, this module keeps the exact same public
 * surface (`query(text, params)` -> `{ rows, rowCount, insertId }`,
 * `withTransaction(fn)`) and translates the SQL text to MySQL on the fly:
 *
 *   - $1, $2, ...                    -> ?  (positional, mysql2)
 *   - ILIKE                          -> LIKE (MySQL's default utf8mb4
 *                                        collations are already case
 *                                        insensitive, so this is a
 *                                        behaviour-preserving swap)
 *   - ::int / ::numeric / etc.       -> stripped (MySQL has no cast
 *                                        operator syntax; the surrounding
 *                                        SQL already produces the right
 *                                        type)
 *   - now()                          -> passes straight through; MySQL
 *                                        has a native NOW() function
 *   - RETURNING ...                  -> emulated: the mutation runs
 *                                        first, then a follow-up SELECT
 *                                        fetches the affected row(s)
 *   - ON CONFLICT (...) DO NOTHING   -> INSERT IGNORE
 *   - ON CONFLICT (...) DO UPDATE
 *       SET col = $n                -> ON DUPLICATE KEY UPDATE
 *                                        col = VALUES(col)
 *   - ORDER BY x NULLS LAST/FIRST    -> rewritten using MySQL's default
 *                                        NULL-sorts-lowest behaviour, or
 *                                        an extra `x IS [NOT] NULL` sort
 *                                        key when that default disagrees
 *                                        with the requested position
 *
 * Postgres schemas generated UUID primary keys server-side via a column
 * DEFAULT (uuid_generate_v4()/gen_random_uuid()). MySQL's schema here
 * mirrors that with `DEFAULT (UUID())` too, but since INSERT...RETURNING
 * has no MySQL equivalent, this layer needs to know the id of the row it
 * just wrote *before* it can SELECT it back — so for any INSERT that
 * doesn't explicitly supply an `id` column, the id is generated here in
 * JS (crypto.randomUUID()) and injected into the statement. This also
 * means every UUID actually stored was minted by Node, not MySQL — the
 * column DEFAULT only exists as a safety net for any INSERT written
 * outside this layer.
 * ---------------------------------------------------------------------
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();

// ---------------------------------------------------------------------
// Pool setup
// ---------------------------------------------------------------------
function buildPoolConfig() {
  const base = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    queueLimit: 0,
    decimalNumbers: true, // return DECIMAL columns as JS numbers, not strings
    timezone: 'Z',
  };

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dreamnexa',
    ...base,
  };
}

const rawPool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool(buildPoolConfig());

if (process.env.NODE_ENV === 'development' && process.env.DB_LOG !== '0') {
  const cfg = buildPoolConfig();
  // eslint-disable-next-line no-console
  console.log(
    `[db] using mysql @ ${process.env.DATABASE_URL ? '(DATABASE_URL)' : `${cfg.host}:${cfg.port}/${cfg.database}`}`
  );
}

// Tables whose primary key is NOT a generated `id` column (their PK is a
// foreign key to another table, e.g. profiles.user_id) — never inject a
// generated id for these.
const NO_ID_TABLES = new Set(['profiles']);

// Columns that are JSON-in-a-TEXT-column (mirrors the old sqlite layer) —
// auto-parsed back into JS values on the way out, and auto-stringified
// going in whenever the param is an array/object.
const JSON_COLUMNS = new Set([
  'reward_structure', 'options', 'correct_options', 'selected_options',
  'details', 'metadata', 'violation_counts', 'consent', 'device_lock',
  'system_check', 'evidence_ref', 'key_points', 'exam_tags', 'tags',
]);

// Columns that are boolean flags stored as TINYINT(1) — converted back to
// real JS booleans for API responses.
const BOOLEAN_COLUMNS = new Set([
  'email_verified', 'revoked', 'auto_regenerate', 'is_active', 'is_published',
  'auto_submitted', 'is_correct', 'is_read', 'is_featured', 'reviewed',
  'camera_granted', 'microphone_granted', 'privacy_notice_acknowledged',
  'camera_ok', 'microphone_ok', 'face_detected_ok', 'browser_compatible_ok',
  'network_ok', 'fullscreen_ok', 'proctoring_enabled',
]);

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  for (const key of Object.keys(row)) {
    const value = row[key];
    if (JSON_COLUMNS.has(key) && typeof value === 'string') {
      try {
        row[key] = JSON.parse(value);
      } catch {
        // leave as-is if it wasn't actually JSON
      }
    } else if (BOOLEAN_COLUMNS.has(key) && (value === 0 || value === 1)) {
      row[key] = value === 1;
    }
  }
  return row;
}

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

function normalizeParam(p) {
  if (typeof p === 'boolean') return p ? 1 : 0;
  if (p instanceof Date) return p;
  if (p === undefined) return null;
  // The app occasionally builds ISO-8601 strings in JS (e.g.
  // `new Date(...).toISOString()`) for DATETIME/TIMESTAMP columns.
  // MySQL's text protocol doesn't accept the `T`/`Z` ISO format, so
  // convert those to a real Date object and let mysql2 serialize it.
  if (typeof p === 'string' && ISO_DATETIME_RE.test(p)) return new Date(p);
  if (Array.isArray(p) || (p && typeof p === 'object')) return JSON.stringify(p);
  return p;
}

// ---------------------------------------------------------------------
// SQL text helpers
// ---------------------------------------------------------------------

// Splits a comma-separated list, respecting parenthesis nesting (so a
// function call or sub-expression containing a comma isn't split apart).
function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of str) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim() !== '') parts.push(current);
  return parts.map((s) => s.trim());
}

// Replaces every `$N` (and the internal `$GENID` sentinel) with `?`,
// building the ordered parameter array mysql2 needs, in the order the
// placeholders actually appear in the final SQL text (so a repeated $N,
// e.g. from a COALESCE($5, col) pattern, gets its value bound once per
// occurrence, exactly like node-postgres allowed).
function finalizeTokens(sqlText, params, generatedId) {
  const ordered = [];
  const finalSql = sqlText.replace(/\$GENID\b|\$(\d+)/g, (match, num) => {
    if (match === '$GENID') {
      ordered.push(generatedId);
    } else {
      ordered.push(normalizeParam(params[Number(num) - 1]));
    }
    return '?';
  });
  return { sql: finalSql, params: ordered };
}

async function exec(executor, sql, params) {
  try {
    const [result] = await executor.execute(sql, params);
    if (Array.isArray(result)) {
      // SELECT-like statement: `result` is the row array.
      return { rows: result.map(normalizeRow), rowCount: result.length };
    }
    // INSERT / UPDATE / DELETE: `result` is a ResultSetHeader.
    return { rows: [], rowCount: result.affectedRows, insertId: result.insertId };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Database query failed:', err.message, '\nSQL:', sql);
    }
    // Normalize MySQL's duplicate-key error to look like the Postgres
    // unique-violation code (23505) that errorHandler.js / controllers
    // already check for.
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
      err.code = '23505';
    }
    throw err;
  }
}

/**
 * Handles a plain (no RETURNING) SELECT / UPDATE / DELETE / anything else.
 */
async function runPlain(executor, sql, params) {
  const { sql: finalSql, params: finalParams } = finalizeTokens(sql, params, null);
  return exec(executor, finalSql, finalParams);
}

/**
 * Handles INSERT statements, including ON CONFLICT -> INSERT IGNORE /
 * ON DUPLICATE KEY UPDATE translation and RETURNING emulation.
 */
async function runInsert(executor, sql, params, { ignore, conflictAssignments, returningCols }) {
  const headerMatch = sql.match(/^INSERT\s+INTO\s+`?(\w+)`?\s*\(([^)]*)\)\s*VALUES\s*\(([^)]*)\)\s*$/is);

  if (!headerMatch) {
    // Structurally unexpected INSERT (not used anywhere in this codebase
    // today) — fall back to a plain pass-through rather than guessing.
    return runPlain(executor, sql, params);
  }

  const [, table, colsRaw, valsRaw] = headerMatch;
  const cols = splitTopLevel(colsRaw).map((c) => c.replace(/["`]/g, ''));
  const valTokens = splitTopLevel(valsRaw);

  let generatedId = null;
  if (!NO_ID_TABLES.has(table.toLowerCase()) && !cols.some((c) => c.toLowerCase() === 'id')) {
    generatedId = crypto.randomUUID();
    cols.unshift('id');
    valTokens.unshift('$GENID');
  }

  let finalSqlText = `INSERT ${ignore ? 'IGNORE ' : ''}INTO \`${table}\` (${cols
    .map((c) => `\`${c}\``)
    .join(', ')}) VALUES (${valTokens.join(', ')})`;

  if (conflictAssignments) {
    const assignments = splitTopLevel(conflictAssignments).map((assignment) => {
      const m = assignment.match(/^["`]?(\w+)["`]?\s*=\s*([\s\S]+)$/);
      if (!m) return assignment;
      const col = m[1];
      const rhs = m[2].trim();
      // If the RHS is a single $N placeholder for a column that's also
      // part of this INSERT's column list, it's an upsert re-writing the
      // same value — use MySQL's VALUES(col) form. Otherwise (a literal
      // like 'admin', or an expression) keep it verbatim.
      if (/^\$\d+$/.test(rhs) && cols.some((c) => c.toLowerCase() === col.toLowerCase())) {
        return `\`${col}\` = VALUES(\`${col}\`)`;
      }
      return `\`${col}\` = ${rhs}`;
    });
    finalSqlText += ` ON DUPLICATE KEY UPDATE ${assignments.join(', ')}`;
  }

  const { sql: boundSql, params: boundParams } = finalizeTokens(finalSqlText, params, generatedId);
  const result = await exec(executor, boundSql, boundParams);

  if (!returningCols) return result;

  if (!generatedId) {
    // Table already had an explicit `id` in its column list (not used
    // anywhere currently) — nothing we can look up safely, so mirror
    // Postgres's "no row" rather than guessing.
    return { rows: [], rowCount: result.rowCount };
  }

  if (ignore && result.rowCount === 0) {
    // INSERT IGNORE skipped a conflicting row — Postgres's
    // ON CONFLICT ... DO NOTHING RETURNING * returns no row in this case.
    return { rows: [], rowCount: 0 };
  }

  const selectCols = returningCols === '*' ? '*' : returningCols;
  const [rows] = await executor.execute(`SELECT ${selectCols} FROM \`${table}\` WHERE id = ?`, [generatedId]);
  const normalized = rows.map(normalizeRow);
  return { rows: normalized, rowCount: normalized.length };
}

/**
 * Handles UPDATE/DELETE ... RETURNING by running the mutation, then a
 * follow-up SELECT reusing the same WHERE clause (captured before the
 * DELETE runs, since the row won't exist to select afterwards).
 */
async function runMutateWithReturning(executor, stmtType, sql, params, returningCols) {
  const tableMatch = sql.match(/^(?:UPDATE|DELETE\s+FROM)\s+`?(\w+)`?/i);
  const table = tableMatch ? tableMatch[1] : null;
  const whereMatch = sql.match(/\bWHERE\b[\s\S]*$/i);
  const selectCols = returningCols === '*' ? '*' : returningCols;

  if (!table || !whereMatch) {
    // No WHERE clause to key off — just run it and report affected rows.
    return runPlain(executor, sql, params);
  }

  if (stmtType === 'DELETE') {
    const { sql: selSql, params: selParams } = finalizeTokens(
      `SELECT ${selectCols} FROM \`${table}\` ${whereMatch[0]}`,
      params,
      null
    );
    const [preRows] = await executor.execute(selSql, selParams);

    const { sql: finalSql, params: finalParams } = finalizeTokens(sql, params, null);
    const result = await exec(executor, finalSql, finalParams);

    return { rows: preRows.map(normalizeRow), rowCount: result.rowCount };
  }

  // UPDATE
  const { sql: finalSql, params: finalParams } = finalizeTokens(sql, params, null);
  const result = await exec(executor, finalSql, finalParams);

  const { sql: selSql, params: selParams } = finalizeTokens(
    `SELECT ${selectCols} FROM \`${table}\` ${whereMatch[0]}`,
    params,
    null
  );
  const [rows] = await executor.execute(selSql, selParams);

  return { rows: rows.map(normalizeRow), rowCount: rows.length };
}

/**
 * Core entry point: translates one statement (Postgres-flavoured SQL +
 * `$N` params) and runs it against the given executor (either the shared
 * pool, or a single connection borrowed for a transaction).
 */
async function rawQuery(executor, text, params = []) {
  let sql = text.trim().replace(/;\s*$/, '');

  // Type casts: ::int, ::numeric, ::text[], etc. — MySQL has no cast
  // operator syntax and doesn't need these anyway.
  sql = sql.replace(/::[a-zA-Z_][a-zA-Z0-9_]*(\[\])?/g, '');
  // ILIKE -> LIKE (MySQL's default utf8mb4 collations are already
  // case-insensitive, so this is a behaviour-preserving swap).
  sql = sql.replace(/\bILIKE\b/gi, 'LIKE');

  // ORDER BY ... NULLS LAST / NULLS FIRST has no MySQL equivalent.
  // MySQL sorts NULL as the smallest possible value, so ASC already
  // puts NULLs first and DESC already puts them last — those two
  // combinations are simply stripped. The other two combinations need
  // an extra leading sort key to force the placement explicitly.
  sql = sql.replace(
    /([`"\w.]+)(\s+(ASC|DESC))?\s+NULLS\s+(LAST|FIRST)/gi,
    (_match, expr, _dirGroup, dir, nulls) => {
      const direction = (dir || 'ASC').toUpperCase();
      const nullsPos = nulls.toUpperCase();
      if (direction === 'ASC' && nullsPos === 'LAST') return `${expr} IS NULL, ${expr} ASC`;
      if (direction === 'DESC' && nullsPos === 'FIRST') return `${expr} IS NOT NULL, ${expr} DESC`;
      return `${expr} ${direction}`;
    }
  );

  let returningCols = null;
  const returningMatch = sql.match(/\bRETURNING\s+([\s\S]+)$/i);
  if (returningMatch) {
    returningCols = returningMatch[1].trim();
    sql = sql.slice(0, returningMatch.index).trim();
  }

  const stmtType = /^INSERT\b/i.test(sql)
    ? 'INSERT'
    : /^UPDATE\b/i.test(sql)
      ? 'UPDATE'
      : /^DELETE\b/i.test(sql)
        ? 'DELETE'
        : 'OTHER';

  if (stmtType === 'INSERT') {
    let ignore = false;
    let conflictAssignments = null;
    const conflictMatch = sql.match(/\bON CONFLICT\b\s*(?:\([^)]*\))?\s*DO\s+(NOTHING|UPDATE\s+SET\s+([\s\S]+))$/i);
    if (conflictMatch) {
      sql = sql.slice(0, conflictMatch.index).trim();
      if (/^NOTHING/i.test(conflictMatch[1])) {
        ignore = true;
      } else {
        conflictAssignments = conflictMatch[2].trim();
      }
    }
    return runInsert(executor, sql, params, { ignore, conflictAssignments, returningCols });
  }

  if ((stmtType === 'UPDATE' || stmtType === 'DELETE') && returningCols) {
    return runMutateWithReturning(executor, stmtType, sql, params, returningCols);
  }

  return runPlain(executor, sql, params);
}

// ---------------------------------------------------------------------
// Public surface (unchanged from the old pg/sqlite versions)
// ---------------------------------------------------------------------

/**
 * Run a single statement against the shared pool. Mirrors the old `pg`
 * Pool#query surface: returns { rows, rowCount }.
 */
async function query(text, params = []) {
  return rawQuery(rawPool, text, params);
}

/**
 * Run a set of operations inside a transaction. `fn` receives a client
 * with the same `.query` signature; commits on success, rolls back on
 * error. All statements run on the same borrowed connection.
 */
async function withTransaction(fn) {
  const conn = await rawPool.getConnection();
  try {
    await conn.beginTransaction();
    const client = { query: (text, params) => rawQuery(conn, text, params) };
    const result = await fn(client);
    await conn.commit();
    return result;
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // ignore rollback failures (e.g. connection already dropped)
    }
    throw err;
  } finally {
    conn.release();
  }
}

const pool = {
  query,
  end: async () => rawPool.end(),
};

module.exports = { pool, query, withTransaction, rawPool };
