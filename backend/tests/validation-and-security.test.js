const request = require('supertest');
const { getApp, buildUserPayload, registerUser } = require('./helpers/factories');

describe('Validation & error handling', () => {
  const app = getApp();

  it('returns 400 (not a 500 crash) for malformed JSON in the request body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ this is not valid json');
    expect(res.status).toBe(400);
  });

  it('gives a clean 400 (no stack trace) when an admin debit would take a balance negative', async () => {
    // NODE_ENV is "test" here (see tests/setupEnv.js), so errorHandler.js
    // must NOT include the `details` field on a thrown error, and the
    // response should only ever contain the safe, human publicMessage.
    const { user, payload: adminPayload } = await registerUser(request, app);
    const { promoteToAdmin } = require('./helpers/factories');
    promoteToAdmin(user.id);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: adminPayload.username, password: adminPayload.password });

    const { user: target } = await registerUser(request, app); // starts with 50 points

    const res = await request(app)
      .post(`/api/admin/users/${target.id}/points-adjustment`)
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ amount: -1000, reason: 'QA overdraft attempt' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/enough points/i);
    expect(res.body).not.toHaveProperty('details');
    expect(JSON.stringify(res.body)).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)/); // no stack-trace-shaped text
  });

  it('rejects a contest-join request for a non-existent contest with 404, not a crash', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app)
      .post('/api/contests/00000000-0000-0000-0000-000000000000/join')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  it('handles a completely malformed contest id in the URL without crashing', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app)
      .post(`/api/contests/${encodeURIComponent("'; DROP TABLE contests; --")}/join`)
      .set('Authorization', `Bearer ${accessToken}`);
    // Must not 500 — parameterized queries mean this is just "not found", never SQL execution.
    expect([400, 404]).toContain(res.status);
  });

  it('safely stores and returns a profile field containing an XSS-style payload as inert text', async () => {
    const { accessToken } = await registerUser(request, app);
    const payload = '<script>alert(1)</script>';
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ college: payload });
    expect(res.status).toBe(200);
    // The API layer stores it verbatim as a string (escaping is the
    // frontend's job when rendering) — the key security property is that
    // it never gets executed as SQL or crashes the request.
    expect(res.body.college).toBe(payload);
  });

  it('an unauthenticated SQL-injection-style login attempt is rejected, not bypassed', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: "admin' OR '1'='1", password: "' OR '1'='1" });
    expect(res.status).toBe(401);
  });

  it('rejects a bulk-credit admin request missing amount or reason', async () => {
    // NOTE: bulkCreditPoints credits *every* active student in the DB, so we
    // intentionally only exercise the validation-failure paths here — a
    // successful call would mutate point balances that other test files
    // assert on, since the whole suite shares one SQLite file.
    const { user, payload } = await registerUser(request, app);
    const { promoteToAdmin } = require('./helpers/factories');
    promoteToAdmin(user.id);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });

    const missingReason = await request(app)
      .post('/api/admin/users/bulk-credit')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ amount: 10 });
    expect(missingReason.status).toBe(400);

    const negativeAmount = await request(app)
      .post('/api/admin/users/bulk-credit')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ amount: -5, reason: 'test' });
    expect(negativeAmount.status).toBe(400);
  });
});

describe('CORS', () => {
  const app = getApp();

  it('does not set Access-Control-Allow-Origin for a disallowed origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://evil-attacker-site.example.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('allows the configured CLIENT_URL origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});

describe('Sensitive data exposure', () => {
  const app = getApp();

  it('never includes password_hash in any auth or profile response', async () => {
    const { payload } = await registerUser(request, app);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    expect(JSON.stringify(loginRes.body).toLowerCase()).not.toContain('password_hash');
    expect(JSON.stringify(loginRes.body).toLowerCase()).not.toContain(payload.password.toLowerCase());
  });

  it('health check does not leak environment variables or secrets', async () => {
    const res = await request(app).get('/api/health');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/secret/i);
    expect(body).not.toMatch(/jwt/i);
  });
});
