const crypto = require('crypto');

/**
 * Returns a fresh supertest agent bound to a fresh require of src/app.js.
 * Call this from inside each test file (not shared across files) since
 * express-rate-limit stores its counters in-memory per app instance —
 * fresh require = fresh rate-limit counters for that file's tests.
 */
function getApp() {
  // eslint-disable-next-line global-require
  return require('../../src/app');
}

function getDb() {
  // eslint-disable-next-line global-require
  const { db } = require('../../src/db/pool');
  return db;
}

function uniqueSuffix() {
  return crypto.randomBytes(4).toString('hex');
}

function buildUserPayload(overrides = {}) {
  const suffix = uniqueSuffix();
  return {
    username: `testuser_${suffix}`,
    fullName: `Test User ${suffix}`,
    email: `testuser_${suffix}@example.com`,
    password: 'password123',
    ...overrides,
  };
}

/**
 * Registers a brand-new user via the real HTTP API and returns
 * { user, accessToken, refreshToken, payload }.
 */
async function registerUser(request, app, overrides = {}) {
  const payload = buildUserPayload(overrides);
  const res = await request(app).post('/api/auth/register').send(payload);
  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { ...res.body, payload };
}

async function promoteToAdmin(userId) {
  const { query } = require('../../src/db/pool');
  await query(`UPDATE users SET role = 'admin' WHERE id = $1`, [userId]);
}

module.exports = { getApp, getDb, uniqueSuffix, buildUserPayload, registerUser, promoteToAdmin };
