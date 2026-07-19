import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 0,
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {})
});

connection.on('error', (err) => {
  console.error('[Redis Error]', err);
});

connection.on('connect', () => {
  console.log('[Redis] Connected to BullMQ Redis Server');
});
