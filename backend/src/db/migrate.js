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
  try {
    await runSqlFile('schema.sql');
    await runSqlFile('newsContentSchema.sql');
    await runSqlFile('newsSchema.sql');
  } catch (err) {
    console.error('✖ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
