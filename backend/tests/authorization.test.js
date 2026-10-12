const request = require('supertest');
const { getApp, registerUser, promoteToAdmin } = require('./helpers/factories');

describe('Authorization', () => {
  const app = getApp();

  it('rejects protected routes with no Authorization header', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects a malformed Authorization header (no Bearer prefix)', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', 'sometoken');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage/invalid JWT', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer not.a.valid.jwt');
    expect(res.status).toBe(401);
  });

  it('rejects an empty Bearer token', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('allows a logged-in student to access their own profile', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  it('blocks a student (non-admin) from an admin-only route with 403', async () => {
    const { accessToken } = await registerUser(request, app);
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('allows an admin user to access an admin-only route', async () => {
    const { user, accessToken: staleToken, payload } = await registerUser(request, app);
    promoteToAdmin(user.id);

    // The access token issued at registration still has role="student" baked
    // in (JWTs are immutable), so log in again to get a token reflecting the
    // freshly-promoted admin role — this mirrors what a real client would do.
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ usernameOrEmail: payload.username, password: payload.password });
    expect(loginRes.body.user.role).toBe('admin');

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
    expect(res.status).toBe(200);

    // Sanity: the stale pre-promotion token should NOT carry admin rights.
    const staleRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${staleToken}`);
    expect(staleRes.status).toBe(403);
  });
});
