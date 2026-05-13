const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const MenuItem = require('../src/models/MenuItem');
const Category = require('../src/models/Category');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kamancha_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  await MenuItem.deleteMany({});
  await Category.deleteMany({});

  await Category.create({
    slug: 'mains',
    name: { en: 'Main Courses', hy: 'Հիմնական' },
    sort_order: 1,
  });

  await MenuItem.create({
    name: { en: 'Test Dish', hy: 'Փորձ', ru: 'Тест' },
    description: { en: 'A test dish', hy: 'Փ', ru: 'Тест блюдо' },
    price: 2500,
    category: 'mains',
    is_available: true,
    is_popular: true,
  });
});

afterAll(async () => {
  await MenuItem.deleteMany({});
  await Category.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/menu', () => {
  it('returns all menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it('returns localized names', async () => {
    const res = await request(app).get('/api/menu?lang=en');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Test Dish');
  });

  it('filters by popular', async () => {
    const res = await request(app).get('/api/menu?popular=true');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/menu?category=mains');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns empty for unknown category', async () => {
    const res = await request(app).get('/api/menu?category=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/menu/categories', () => {
  it('returns categories', async () => {
    const res = await request(app).get('/api/menu/categories');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].slug).toBe('mains');
  });
});

describe('GET /api/menu/:category', () => {
  it('returns items for category', async () => {
    const res = await request(app).get('/api/menu/mains?lang=en');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Test Dish');
  });
});
