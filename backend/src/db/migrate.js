require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { rawPool, pool } = require('./pool');

// Error codes that mean "this object already exists" — safe to ignore so
// migrations can run on every boot (see runMigrations doc below).
const IDEMPOTENT_ERROR_CODES = new Set([
  'ER_DUP_KEYNAME', // CREATE INDEX on an index that already exists
  'ER_DUP_FIELDNAME', // a column already exists
  'ER_FK_DUP_NAME', // a foreign key constraint name already exists
]);

// Splits a .sql file into individual statements. Good enough for this
// project's schema files: no stored procedures/triggers with embedded
// semicolons, and string literals here never contain a `;` character.
// Leading full-line `--` comments (section headers) are stripped from
// each chunk rather than causing the whole statement to be dropped —
// only a chunk that is comments (or blank) *all the way through* is
// discarded.
function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((chunk) =>
      chunk
        .split('\n')
        .filter((line) => !/^\s*--/.test(line))
        .join('\n')
        .trim()
    )
    .filter((s) => s.length > 0);
}

async function runSqlFile(filename) {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = splitStatements(sql);
  console.log(`Running ${filename} migration (${statements.length} statements)...`);
  for (const statement of statements) {
    try {
      await rawPool.query(statement);
    } catch (err) {
      if (IDEMPOTENT_ERROR_CODES.has(err.code)) {
        continue; // already applied on a previous boot — fine
      }
      console.error(`✖ Statement failed in ${filename}:\n${statement}\n`);
      throw err;
    }
  }
  console.log(`✔ ${filename} executed successfully.`);
}

async function tableExists(tableName) {
  const [rows] = await rawPool.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  return rows.length > 0;
}

/**
 * Runs every schema/migration file. Every statement uses
 * `CREATE TABLE IF NOT EXISTS`, so this is safe to call on every single
 * server boot (local `npm start`, Render, Vercel, tests, ...) — it is
 * intentionally NOT gated behind a one-time "ran already" flag, because
 * that flag is exactly what let this project ship with an empty database
 * (every request silently falling back to demo/mock data instead of
 * failing loudly). Call this before the server starts accepting traffic.
 */
async function runMigrations() {
  if (!(await tableExists('users'))) {
    await runSqlFile('schema.sql');
  } else {
    console.log('schema.sql migration skipped: users table already exists.');
  }
  await runSqlFile('newsContentSchema.sql');
  await runSqlFile('newsSchema.sql');
  await runSqlFile('walletSchema.sql');
  await runSqlFile('couponSchema.sql');
  await runSqlFile('proctoringSchema.sql');
  await runSqlFile('govtJobsSchema.sql');
  await runSqlFile('currentAffairsSchema.sql');
  console.log('✔ All migrations complete. DreamNexa is running on MySQL.');
}

// CLI entrypoint: `npm run migrate`
if (require.main === module) {
  (async () => {
    try {
      await runMigrations();
    } catch (err) {
      console.error('✖ Migration failed:', err);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  })();
}

module.exports = { runMigrations, tableExists };
