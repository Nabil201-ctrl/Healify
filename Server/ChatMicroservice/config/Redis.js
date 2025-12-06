import { createClient } from 'redis';
import dotenv from "dotenv"
dotenv.config()

let REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
if (!REDIS_URL.includes('://')) {
  console.warn(`[Redis] URL missing protocol, prepending redis:// to ${REDIS_URL}`);
  REDIS_URL = `redis://${REDIS_URL}`;
}
console.log(`[Redis] Connecting to: ${REDIS_URL}`);

let redisClient = null;

async function createRedisConnection() {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: REDIS_URL,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected (ChatMicroservice)');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call createRedisConnection first.');
  }
  return redisClient;
}

async function cacheResponse(sessionId, response, ttl = 3600) {
  const client = getRedisClient();
  await client.setEx(`ai:response:${sessionId}`, ttl, JSON.stringify(response));
}

async function getCachedResponse(sessionId) {
  const client = getRedisClient();
  const cached = await client.get(`ai:response:${sessionId}`);
  return cached ? JSON.parse(cached) : null;
}

export { createRedisConnection, getRedisClient, cacheResponse, getCachedResponse };
