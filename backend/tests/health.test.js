const request = require('supertest');
const { getApp } = require('./helpers/factories');

describe('GET /api/health', () => {
  const app = getApp();

  it('returns 200 and service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'dreamnexa-backend' });
  });

  it('returns 404 for an unknown route', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
