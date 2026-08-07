require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function runSqlFile(filename) {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Running ${filename} migration...`);
  await pool.query(sql);
  console.log(`✔ ${filename} executed successfully.`);
}

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('✖ Migration failed: DATABASE_URL environment variable is missing.');
    process.exitCode = 1;
    return;
  }
  try {
    await runSqlFile('schema.sql');
    await runSqlFile('newsContentSchema.sql');
    await runSqlFile('newsSchema.sql');
    await runSqlFile('walletSchema.sql');
  } catch (err) {
    console.error('✖ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
