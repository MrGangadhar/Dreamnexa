/**
 * Jest globalSetup — runs ONCE before any test file, in its own process.
 *
 * Creates a brand-new SQLite database file dedicated to the test run
 * (deleting any leftovers from a previous run) and applies every
 * migration against it via the project's own migrate script, so the
 * schema tests run against is byte-for-byte the same schema the app
 * uses in dev/prod.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { TEST_DB_PATH } = require('./helpers/paths');

module.exports = async function globalSetup() {
  const dir = path.dirname(TEST_DB_PATH);
  fs.mkdirSync(dir, { recursive: true });

  // Remove any DB file (and WAL/SHM sidecars) left over from a previous run.
  for (const suffix of ['', '-wal', '-shm']) {
    const p = TEST_DB_PATH + suffix;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  execFileSync(process.execPath, [path.join(__dirname, '..', 'src', 'db', 'migrate.js')], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      SQLITE_PATH: TEST_DB_PATH,
      NODE_ENV: 'test',
      SQLITE_LOG: '0',
      JWT_ACCESS_SECRET: 'test-access-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
    },
    stdio: 'inherit',
  });
};
