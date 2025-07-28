import { createClient } from 'redis';

// Redis configuration - uses environment variable
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

const client = createClient(redisConfig);

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

client.on('disconnect', () => {
  console.log('⚠️ Redis disconnected');
});

// Initialize connection
let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }
  return client;
}

// Helper functions for search caching
export class SearchCache {
  private static TTL = 300; // 5 minutes cache

  static async get(key: string): Promise<any> {
    try {
      const redis = await getRedisClient();
      const result = await redis.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = SearchCache.TTL): Promise<void> {
    try {
      const redis = await getRedisClient();
      await redis.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  static async invalidate(pattern: string): Promise<void> {
    try {
      const redis = await getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Redis INVALIDATE error:', error);
    }
  }

  // Generate cache key for search queries
  static generateSearchKey(query: string, categoryId?: number, sortBy?: string): string {
    return `search:${query}:${categoryId || 'all'}:${sortBy || 'relevance'}`;
  }

  // Generate cache key for post feed
  static generateFeedKey(categoryId?: number, limit?: number): string {
    return `feed:${categoryId || 'all'}:${limit || 10}`;
  }

  // Generate cache key for user posts
  static generateUserPostsKey(userId: string, status?: string): string {
    return `user_posts:${userId}:${status || 'all'}`;
  }
}

export default client;

