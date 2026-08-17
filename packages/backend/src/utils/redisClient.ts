import { createClient, RedisClientType } from 'redis';

const redis: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', () => {
  // Suppress unhandled error log when Redis is offline
});

async function connect() {
  if (!redis.isOpen) {
    await redis.connect().catch(() => {});
  }
}

connect();

export default redis;
