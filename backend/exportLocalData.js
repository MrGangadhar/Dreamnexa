/**
 * exportLocalData.js
 * ------------------------------------------------------------------
 * Exports your local MySQL data (current_affairs, govt_jobs, news_articles)
 * as SQL INSERT statements that can be imported into Cloud SQL.
 *
 * Usage:
 *   node exportLocalData.js > exported_data.sql
 *   -- or --
 *   node exportLocalData.js  (writes to ./exported_data.sql by default)
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function escapeSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString().replace('T', ' ').replace('Z', '')}'`;
  // Stringify objects/arrays
  if (typeof val === 'object') val = JSON.stringify(val);
  // Escape single quotes and backslashes
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function buildInserts(table, rows) {
  if (!rows.length) return `-- No rows in ${table}\n`;
  const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
  const valueLines = rows.map(row => {
    const vals = Object.values(row).map(v => {
      // Handle Buffer / binary
      if (Buffer.isBuffer(v)) return `'${v.toString()}'`;
      return escapeSQL(v);
    }).join(', ');
    return `  (${vals})`;
  });
  return `INSERT IGNORE INTO \`${table}\` (${cols}) VALUES\n${valueLines.join(',\n')};\n`;
}

async function main() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dreamnexa',
    });

    console.error('✅ Connected to local MySQL:', process.env.DB_NAME);

    const tables = ['current_affairs', 'govt_jobs', 'news_articles'];
    const lines = [];

    lines.push(`-- ============================================================`);
    lines.push(`-- DreamNexa Local Data Export`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(`-- Source DB: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    lines.push(`-- ============================================================`);
    lines.push(`SET NAMES utf8mb4;`);
    lines.push(`SET time_zone = '+00:00';`);
    lines.push(``);

    for (const table of tables) {
      const [rows] = await conn.execute(`SELECT * FROM \`${table}\` ORDER BY created_at ASC`);
      console.error(`📋 ${table}: ${rows.length} rows`);
      lines.push(`-- ----- ${table} (${rows.length} rows) -----`);
      lines.push(buildInserts(table, rows));
    }

    const output = lines.join('\n');
    const outFile = path.join(__dirname, 'exported_data.sql');
    fs.writeFileSync(outFile, output, 'utf8');
    console.error(`\n✅ Exported to: ${outFile}`);
    console.error(`\n📌 Next step: Import this file into your Cloud SQL database.`);
    console.error(`   See the instructions below.\n`);

  } catch (err) {
    console.error('❌ Export failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
