const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = require('../src/app');
const { prisma } = require('../src/config/db');
const MenuItem = require('../src/models/MenuItem');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kamancha_test';

let adminToken;

beforeAll(async () => {
  await prisma.$connect();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  const hash = await bcrypt.hash('TestAdmin123!', 10);
  await prisma.adminUser.upsert({
    where: { email: 'testadmin@kamancha.am' },
    create: { email: 'testadmin@kamancha.am', name: 'Test Admin', password: hash },
    update: { password: hash },
  });

  await MenuItem.deleteMany({ category: 'test-cat' });
});

afterAll(async () => {
  await MenuItem.deleteMany({ category: 'test-cat' });
  await prisma.adminUser.deleteMany({ where: { email: 'testadmin@kamancha.am' } });
  await prisma.$disconnect();
  await mongoose.disconnect();
});

describe('POST /api/admin/login', () => {
  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'testadmin@kamancha.am', password: 'TestAdmin123!' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    adminToken = res.body.accessToken;
  });

  it('rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'testadmin@kamancha.am', password: 'WrongPassword123!' });
    expect(res.status).toBe(401);
  });
});

describe('Admin menu CRUD', () => {
  let createdId;

  it('creates a menu item', async () => {
    const res = await request(app)
      .post('/api/admin/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: { en: 'Admin Test Dish', hy: 'Փ-ո-ր-ձ' },
        description: { en: 'For testing', hy: 'Փ-ո-ր-ձ-ա-ր-կ-ո-ւ-մ' },
        price: 1000,
        category: 'test-cat',
      });
    expect(res.status).toBe(201);
    createdId = res.body._id;
  });

  it('deletes a menu item', async () => {
    const res = await request(app)
      .delete(`/api/admin/menu/${createdId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/admin/reservations');
    expect(res.status).toBe(401);
  });
});
