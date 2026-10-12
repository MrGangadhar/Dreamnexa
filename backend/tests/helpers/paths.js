const path = require('path');

// Single SQLite file shared by the whole test run. globalSetup.js creates
// and migrates it once; every test file (via setupEnv.js) points its own
// app instance at this same file before requiring src/app.js.
const TEST_DB_PATH = path.join(__dirname, '..', '.tmp', 'test.db');

module.exports = { TEST_DB_PATH };
