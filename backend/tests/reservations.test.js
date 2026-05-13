const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/db');

beforeAll(async () => {
  await prisma.$connect();
  // Clean test data (scoped to test hall only)
  await prisma.reservation.deleteMany({ where: { hallId: 99 } });
  await prisma.hall.deleteMany({ where: { id: 99 } });
  await prisma.hall.create({
    data: { id: 99, name: 'Test Hall', nameHy: 'Փ-ո-ր-ձ-ա-ր-կ-ո-ւ-մ', capacity: 50 },
  });
});

afterAll(async () => {
  await prisma.reservation.deleteMany({});
  await prisma.hall.deleteMany({ where: { id: 99 } });
  await prisma.$disconnect();
});

describe('GET /api/reservations/check', () => {
  it('returns available=true for open slot', async () => {
    const res = await request(app)
      .get('/api/reservations/check?date=2025-12-31&time=19:00&hallId=99');
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
  });

  it('returns 400 when params missing', async () => {
    const res = await request(app).get('/api/reservations/check?date=2025-12-31');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/reservations', () => {
  const validPayload = {
    name: 'Areg Petrosyan',
    phone: '+37491234567',
    email: 'areg@test.com',
    date: '2025-12-31',
    time: '19:00',
    guests: 4,
    hallId: 99,
    lang: 'hy',
  };

  it('creates a reservation successfully', async () => {
    const res = await request(app).post('/api/reservations').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.confirmationCode).toBeDefined();
    expect(res.body.id).toBeDefined();
  });

  it('rejects duplicate time slot', async () => {
    const res = await request(app).post('/api/reservations').send(validPayload);
    expect(res.status).toBe(409);
  });

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({ ...validPayload, email: 'not-an-email', time: '20:00' });
    expect(res.status).toBe(400);
  });

  it('rejects guests over capacity', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({ ...validPayload, guests: 200, time: '21:00' });
    expect(res.status).toBe(400);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/reservations').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });
});
