const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error', err);
});

/**
 * Run a query with automatic connection handling.
 */
async function query(text, params) {
  if (!process.env.DATABASE_URL) {
    return { rows: [], rowCount: 0, fields: [] };
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - start;
      console.log('query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Database query failed', err.message);
    throw err;
  }
}

/**
 * Run a set of operations inside a transaction. `fn` receives a client
 * with the same `.query` signature; commits on success, rolls back on error.
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
