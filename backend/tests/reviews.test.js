const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Review = require('../src/models/Review');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kamancha_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  await Review.deleteMany({});
  await Review.insertMany([
    { author: 'Alice', rating: 5, text: 'Amazing!', lang: 'en', source: 'google' },
    { author: 'Bob', rating: 4, text: 'Very good', lang: 'en', source: 'tripadvisor' },
    { author: 'Ані', rating: 5, text: 'Чудово!', lang: 'ru', source: 'internal' },
  ]);
});

afterAll(async () => {
  await Review.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/reviews', () => {
  it('returns all reviews', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.avgRating).toBeDefined();
  });

  it('filters by source', async () => {
    const res = await request(app).get('/api/reviews?source=google');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].author).toBe('Alice');
  });

  it('filters by lang', async () => {
    const res = await request(app).get('/api/reviews?lang=ru');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
