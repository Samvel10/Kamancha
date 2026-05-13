const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /unknown returns 404', async () => {
    const res = await request(app).get('/unknown-route-xyz');
    expect(res.status).toBe(404);
  });
});
