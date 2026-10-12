const request = require('supertest');
const { getApp, registerUser, promoteToAdmin } = require('./helpers/factories');

describe('User profile CRUD', () => {
  const app = getApp();

  it('GET /api/users/me returns the profile without the password hash', async () => {
    const { accessToken, user } = await registerUser(request, app);
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user.id);
    expect(res.body).not.toHaveProperty('password_hash');
  });

  it('PATCH /api/users/me updates profile fields', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ college: 'MIT', city: 'Bengaluru' });
    expect(res.status).toBe(200);
    expect(res.body.college).toBe('MIT');
    expect(res.body.city).toBe('Bengaluru');
  });

  it('PATCH /api/users/me with no fields leaves existing values untouched (COALESCE)', async () => {
    const { accessToken } = await registerUser(request, app);
    await request(app).patch('/api/users/me').set('Authorization', `Bearer ${accessToken}`).send({ college: 'Keep Me' });
    const res = await request(app).patch('/api/users/me').set('Authorization', `Bearer ${accessToken}`).send({});
    expect(res.status).toBe(200);
    expect(res.body.college).toBe('Keep Me');
  });

  it('GET /api/users/me/points returns the points ledger, most recent first', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app).get('/api/users/me/points').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].type).toBe('signup_bonus');
  });

  it('GET /api/users/me/contests returns an empty array for a brand-new user', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app).get('/api/users/me/contests').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/users/me/badges returns an empty array for a brand-new user', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app).get('/api/users/me/badges').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('Admin user management CRUD', () => {
  const app = getApp();
  let adminToken;

  beforeAll(async () => {
    const { user, payload } = await registerUser(request, app);
    promoteToAdmin(user.id);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    adminToken = login.body.accessToken;
  });

  it('LIST: GET /api/admin/users returns users and supports search', async () => {
    const { payload } = await registerUser(request, app);
    const res = await request(app)
      .get(`/api/admin/users?search=${payload.username}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.some((u) => u.username === payload.username.toLowerCase())).toBe(true);
  });

  it('READ: GET /api/admin/users/:id returns full user detail', async () => {
    const { user } = await registerUser(request, app);
    const res = await request(app)
      .get(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
    expect(res.body).toHaveProperty('quizHistory');
  });

  it('UPDATE: PUT /api/admin/users/:id changes role and profile fields', async () => {
    const { user } = await registerUser(request, app);
    const res = await request(app)
      .put(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ college: 'Admin-Edited College', role: 'admin' });
    expect(res.status).toBe(200);

    const detail = await request(app)
      .get(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(detail.body.user.college).toBe('Admin-Edited College');
    expect(detail.body.user.role).toBe('admin');
  });

  it('STATUS: PATCH /api/admin/users/:id/status suspends and reactivates a user', async () => {
    const { user, payload } = await registerUser(request, app);

    const suspend = await request(app)
      .patch(`/api/admin/users/${user.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'suspended' });
    expect(suspend.status).toBe(200);

    // Suspended users must be blocked at login.
    const loginBlocked = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    expect(loginBlocked.status).toBe(403);

    const reactivate = await request(app)
      .patch(`/api/admin/users/${user.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });
    expect(reactivate.status).toBe(200);

    const loginOk = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    expect(loginOk.status).toBe(200);
  });

  it('STATUS: rejects an invalid status value with 400', async () => {
    const { user } = await registerUser(request, app);
    const res = await request(app)
      .patch(`/api/admin/users/${user.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'not-a-real-status' });
    expect(res.status).toBe(400);
  });

  it('POINTS ADJUSTMENT: credits and debits points with an audit reason', async () => {
    const { user, accessToken } = await registerUser(request, app);

    const credit = await request(app)
      .post(`/api/admin/users/${user.id}/points-adjustment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100, reason: 'QA test credit' });
    expect(credit.status).toBe(200);

    const meAfterCredit = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
    expect(meAfterCredit.body.total_points).toBe(150); // 50 signup + 100 credit

    const debit = await request(app)
      .post(`/api/admin/users/${user.id}/points-adjustment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -30, reason: 'QA test debit' });
    expect(debit.status).toBe(200);

    const meAfterDebit = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
    expect(meAfterDebit.body.total_points).toBe(120);
  });

  it('POINTS ADJUSTMENT: rejects a request missing amount/reason', async () => {
    const { user } = await registerUser(request, app);
    const res = await request(app)
      .post(`/api/admin/users/${user.id}/points-adjustment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 10 });
    expect(res.status).toBe(400);
  });

  it('DELETE: DELETE /api/admin/users/:id soft-deletes the account', async () => {
    const { user, payload } = await registerUser(request, app);

    const del = await request(app)
      .delete(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(200);

    const detail = await request(app)
      .get(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(detail.body.user.status).toBe('deleted');

    // Soft-deleted users can no longer log in.
    const login = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    expect(login.status).toBe(403);
  });
});
