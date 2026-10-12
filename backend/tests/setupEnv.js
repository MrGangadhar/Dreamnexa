const { TEST_DB_PATH } = require('./helpers/paths');

// Runs inside each test file's own module registry, BEFORE any test file
// requires src/app.js — so db/pool.js picks up these values when it reads
// process.env at module-load time. dotenv.config() (called by pool.js /
// app.js) never overrides variables that are already set, so this wins.
process.env.NODE_ENV = 'test';
process.env.SQLITE_PATH = TEST_DB_PATH;
process.env.SQLITE_LOG = '0';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '30d';
process.env.DAILY_LOGIN_POINTS = '10';
process.env.REFERRAL_BONUS_POINTS = '100';
process.env.PROCTORING_ENABLED = 'true';
process.env.USE_MOCK_DATA = 'false';
process.env.CLIENT_URL = 'http://localhost:5173';

const mockCrypto = require('crypto');
jest.mock('uuid', () => ({
  v4: () => mockCrypto.randomUUID(),
  v1: () => mockCrypto.randomUUID(),
  v6: () => mockCrypto.randomUUID(),
  v7: () => mockCrypto.randomUUID(),
  validate: () => true,
}));

// Keep Jest's default 5s timeout comfortable for bcrypt hashing + sqlite I/O.
jest.setTimeout(15000);

