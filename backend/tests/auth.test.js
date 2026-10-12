const request = require('supertest');
const { getApp, buildUserPayload, registerUser } = require('./helpers/factories');

describe('Auth: register', () => {
  const app = getApp();

  it('registers a new user and returns tokens + signup bonus points', async () => {
    const payload = buildUserPayload();
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.username).toBe(payload.username.toLowerCase());
    expect(res.body.user.email).toBe(payload.email.toLowerCase());
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.total_points).toBe(50); // SIGNUP_BONUS_POINTS
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('rejects registration with missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'onlyusername' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects a password shorter than 8 characters', async () => {
    const payload = buildUserPayload({ password: 'short1' });
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/i);
  });

  it('rejects a duplicate username with 409', async () => {
    const payload = buildUserPayload();
    const first = await request(app).post('/api/auth/register').send(payload);
    expect(first.status).toBe(201);

    const dupe = await request(app)
      .post('/api/auth/register')
      .send(buildUserPayload({ username: payload.username, email: `different_${payload.email}` }));
    expect(dupe.status).toBe(409);
    expect(dupe.body).toHaveProperty('error');
  });

  it('rejects a duplicate email with 409', async () => {
    const payload = buildUserPayload();
    const first = await request(app).post('/api/auth/register').send(payload);
    expect(first.status).toBe(201);

    const dupe = await request(app)
      .post('/api/auth/register')
      .send(buildUserPayload({ email: payload.email, username: `different_${payload.username}` }));
    expect(dupe.status).toBe(409);
  });

  it('applies a referral bonus to the referring user', async () => {
    const referrer = await registerUser(request, app);
    const referredPayload = buildUserPayload({ referralCode: referrer.user.referral_code });
    const referred = await request(app).post('/api/auth/register').send(referredPayload);
    expect(referred.status).toBe(201);

    const referrerMe = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${referrer.accessToken}`);
    // 50 signup bonus + 100 referral bonus
    expect(referrerMe.body.total_points).toBe(150);
  });
});

describe('Auth: login', () => {
  const app = getApp();

  it('logs in with correct credentials (username)', async () => {
    const { payload } = await registerUser(request, app);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.username).toBe(payload.username.toLowerCase());
  });

  it('logs in with correct credentials (email)', async () => {
    const { payload } = await registerUser(request, app);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.email, password: payload.password });
    expect(res.status).toBe(200);
  });

  it('rejects an unknown username with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: 'no_such_user_at_all', password: 'whatever123' });
    expect(res.status).toBe(401);
  });

  it('rejects a wrong password with 401', async () => {
    const { payload } = await registerUser(request, app);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects a login request missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ usernameOrEmail: 'x' });
    expect(res.status).toBe(400);
  });

  it('does not leak the password hash anywhere in the response', async () => {
    const { payload } = await registerUser(request, app);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    expect(JSON.stringify(res.body)).not.toMatch(/password_hash/i);
  });
});

describe('Auth: refresh + logout', () => {
  const app = getApp();

  it('issues a new access token from a valid refresh token', async () => {
    const { refreshToken } = await registerUser(request, app);
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('rejects a missing refresh token with 400', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  it('rejects a garbage refresh token with 401', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'not-a-real-token' });
    expect(res.status).toBe(401);
  });

  it('logs out (revokes the refresh token) and it can no longer be used', async () => {
    const { refreshToken } = await registerUser(request, app);

    const logoutRes = await request(app).post('/api/auth/logout').send({ refreshToken });
    expect(logoutRes.status).toBe(200);

    const reuse = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(reuse.status).toBe(401);
  });
});
