/**
 * migrateUsersAndUserData.js
 * -------------------------------------------------------------
 * Migrates all user accounts, profiles, wallets, and user activity
 * from the local database (localhost:3306/dreamnexa) to Cloud SQL.
 */

const mysql = require('mysql2/promise');

const LOCAL_CFG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Gangadhar#14',
  database: 'dreamnexa'
};

const CLOUD_CFG = {
  host: '34.24.153.203',
  port: 3306,
  user: 'root',
  password: 'Gangadhar#14',
  database: 'dreamnexa'
};

const USER_TABLES = [
  'users',
  'profiles',
  'wallets',
  'points_transactions',
  'user_badges',
  'notifications',
  'payout_details',
  'withdrawal_history',
  'admin_logs',
  'contest_participants',
  'quiz_attempts',
  'quiz_answers'
];

async function run() {
  const localConn = await mysql.createConnection(LOCAL_CFG);
  const cloudConn = await mysql.createConnection(CLOUD_CFG);

  console.log('✅ Connected to both Local DB and Cloud SQL');

  // Disable FK checks during migration to avoid ordering constraints
  await cloudConn.query('SET FOREIGN_KEY_CHECKS = 0;');

  // If Cloud SQL has the temporary 'gangu' user, remove it so it doesn't conflict with 'itzgangadhar' (same email)
  console.log('🔄 Cleaning up conflicting temporary test user in Cloud SQL if present...');
  await cloudConn.query("DELETE FROM users WHERE username = 'gangu' OR email = 'meetmrgangadhar@gmail.com';");
  await cloudConn.query("DELETE FROM profiles WHERE user_id = '477f6f61-4395-45f0-af87-d520c4f99f32';");
  await cloudConn.query("DELETE FROM wallets WHERE user_id = '477f6f61-4395-45f0-af87-d520c4f99f32';");

  for (const table of USER_TABLES) {
    const [rows] = await localConn.query(`SELECT * FROM \`${table}\``);
    console.log(`\n📋 Migrating ${table} (${rows.length} rows)...`);
    if (rows.length === 0) continue;

    const cols = Object.keys(rows[0]);
    const colList = cols.map(c => `\`${c}\``).join(', ');
    const placeholders = cols.map(() => '?').join(', ');
    const updateClause = cols.filter(c => c !== 'id').map(c => `\`${c}\`=VALUES(\`${c}\`)`).join(', ');

    const sql = `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`;

    let success = 0;
    for (const row of rows) {
      const values = cols.map(c => {
        const v = row[c];
        if (v === null || v === undefined) return null;
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (v instanceof Date) return v;
        if (typeof v === 'object') return JSON.stringify(v);
        return v;
      });

      try {
        await cloudConn.execute(sql, values);
        success++;
      } catch (err) {
        console.warn(`  ⚠ ${table} row error:`, err.message);
      }
    }
    console.log(`  ✅ ${table}: successfully migrated ${success}/${rows.length} rows`);
  }

  await cloudConn.query('SET FOREIGN_KEY_CHECKS = 1;');

  // Verify Cloud SQL row counts
  console.log('\n📊 Updated Cloud SQL User Data Counts:');
  for (const table of USER_TABLES) {
    const [cnt] = await cloudConn.query(`SELECT COUNT(*) as c FROM \`${table}\``);
    console.log(`  ${table.padEnd(22)}: ${cnt[0].c}`);
  }

  await localConn.end();
  await cloudConn.end();
  console.log('\n🎉 All user data migrated to Cloud SQL successfully!');
}

run().catch(err => console.error('Migration failed:', err));
