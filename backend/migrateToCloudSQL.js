/**
 * migrateToCloudSQL.js
 * ─────────────────────────────────────────────────────────────────
 * Reads your local MySQL data and pushes it directly to Cloud SQL.
 * 
 * USAGE:
 *   1. Fill in the CLOUD SQL credentials below (from Google Cloud Console)
 *   2. Run: node migrateToCloudSQL.js
 * 
 * HOW TO GET CLOUD SQL CREDENTIALS:
 *   Google Cloud Console → SQL → your instance → Overview
 *   → "Connect to this instance" → Public IP address
 * ─────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// ═══════════════════════════════════════════════════════════════
// ➤ FILL IN YOUR CLOUD SQL CREDENTIALS HERE
// ═══════════════════════════════════════════════════════════════
const CLOUD_SQL = {
  host:     process.env.CLOUD_SQL_HOST     || '',   // Public IP from Cloud Console
  port:     process.env.CLOUD_SQL_PORT     || 3306,
  user:     process.env.CLOUD_SQL_USER     || 'root',
  password: process.env.CLOUD_SQL_PASSWORD || '',
  database: process.env.CLOUD_SQL_DB       || 'dreamnexa',
  ssl: { rejectUnauthorized: false },  // Cloud SQL requires SSL
};
// ═══════════════════════════════════════════════════════════════

// Local DB from .env
const LOCAL_DB = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'dreamnexa',
};

const TABLES = ['current_affairs', 'govt_jobs', 'news_articles'];

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function copyTable(localConn, cloudConn, table) {
  console.log(`\n📋 Migrating: ${table}`);

  // Read all rows from local
  const [rows] = await localConn.execute(`SELECT * FROM \`${table}\` ORDER BY created_at ASC`);
  console.log(`   → Found ${rows.length} rows in local DB`);

  if (rows.length === 0) {
    console.log(`   ⏭  Skipping (empty table)`);
    return;
  }

  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `\`${c}\``).join(', ');
  const placeholders = cols.map(() => '?').join(', ');
  const sql = `INSERT IGNORE INTO \`${table}\` (${colList}) VALUES (${placeholders})`;

  let inserted = 0;
  let skipped = 0;

  // Insert in batches of 20
  for (const batch of chunk(rows, 20)) {
    for (const row of batch) {
      const values = cols.map(col => {
        const v = row[col];
        if (v === null || v === undefined) return null;
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (v instanceof Date) return v;
        if (typeof v === 'object') return JSON.stringify(v);
        return v;
      });
      try {
        const [result] = await cloudConn.execute(sql, values);
        if (result.affectedRows > 0) inserted++;
        else skipped++;
      } catch (err) {
        console.warn(`   ⚠  Row error (${row.id}): ${err.message.substring(0, 80)}`);
        skipped++;
      }
    }
  }

  console.log(`   ✅ Inserted: ${inserted} | Already existed (skipped): ${skipped}`);
}

async function main() {
  if (!CLOUD_SQL.host) {
    console.error(`
❌ CLOUD SQL credentials not set!

You have two options:

Option A — Set env vars in terminal then run:
  $env:CLOUD_SQL_HOST="YOUR_CLOUD_SQL_PUBLIC_IP"
  $env:CLOUD_SQL_USER="root"
  $env:CLOUD_SQL_PASSWORD="YOUR_PASSWORD"
  $env:CLOUD_SQL_DB="dreamnexa"
  node migrateToCloudSQL.js

Option B — Edit this file directly:
  Open migrateToCloudSQL.js and fill in the CLOUD_SQL object at the top.

WHERE TO FIND CLOUD SQL PUBLIC IP:
  Google Cloud Console → SQL → your instance → Overview → Public IP address
`);
    process.exit(1);
  }

  let localConn, cloudConn;

  try {
    // Connect to local
    console.log(`🔌 Connecting to local MySQL (${LOCAL_DB.host}:${LOCAL_DB.port}/${LOCAL_DB.database})...`);
    localConn = await mysql.createConnection(LOCAL_DB);
    console.log(`   ✅ Local DB connected`);

    // Connect to Cloud SQL
    console.log(`☁️  Connecting to Cloud SQL (${CLOUD_SQL.host}:${CLOUD_SQL.port}/${CLOUD_SQL.database})...`);
    cloudConn = await mysql.createConnection(CLOUD_SQL);
    console.log(`   ✅ Cloud SQL connected`);

    // Migrate each table
    for (const table of TABLES) {
      await copyTable(localConn, cloudConn, table);
    }

    // Verify counts
    console.log(`\n📊 Final row counts in Cloud SQL:`);
    for (const table of TABLES) {
      const [rows] = await cloudConn.execute(`SELECT COUNT(*) as cnt FROM \`${table}\``);
      console.log(`   ${table}: ${rows[0].cnt} rows`);
    }

    console.log(`\n🎉 Migration complete! Your data is now in Cloud SQL.`);
    console.log(`   Deploy your backend and the live site will use your real DB data.\n`);

  } catch (err) {
    console.error(`\n❌ Migration failed: ${err.message}`);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('connect ETIMEDOUT')) {
      console.error(`
💡 TIP: Cloud SQL requires its Public IP to be authorized.
   Go to: Google Cloud Console → SQL → your instance → Connections → Authorized networks
   Add your current public IP (visit whatismyip.com to find it)
`);
    }
  } finally {
    if (localConn) await localConn.end().catch(() => {});
    if (cloudConn) await cloudConn.end().catch(() => {});
  }
}

main();
