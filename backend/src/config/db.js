const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const prisma = new PrismaClient();

let redis;

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    redis.on('error', () => {});
  }
  return redis;
}

async function connectAll() {
  try {
    await prisma.$connect();
  } catch {
    // PostgreSQL not available — tests may mock
  }
  try {
    await connectMongo();
  } catch {
    // MongoDB not available — tests may mock
  }
}

async function disconnectAll() {
  await prisma.$disconnect();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (redis) {
    redis.disconnect();
    redis = null;
  }
}

module.exports = { prisma, connectMongo, getRedis, connectAll, disconnectAll };
