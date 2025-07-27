import { Redis } from 'ioredis';

// Redis client for caching user searches and other data
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
  showFriendlyErrorStack: true,
});

// Cache keys
const CACHE_KEYS = {
  USER_SEARCH: (query: string) => `user_search:${query.toLowerCase()}`,
  USER_BY_EMAIL: (email: string) => `user_email:${email.toLowerCase()}`,
} as const;

// Cache TTL in seconds
const CACHE_TTL = {
  USER_SEARCH: 300, // 5 minutes
  USER_BY_EMAIL: 600, // 10 minutes
} as const;

export class UserCache {
  // Cache user search results
  static async cacheUserSearch(query: string, users: any[]): Promise<void> {
    try {
      const key = CACHE_KEYS.USER_SEARCH(query);
      await redis.setex(key, CACHE_TTL.USER_SEARCH, JSON.stringify(users));
    } catch (error) {
      console.warn('Failed to cache user search:', error);
      // Don't throw - caching should be non-blocking
    }
  }

  // Get cached user search results
  static async getUserSearch(query: string): Promise<any[] | null> {
    try {
      const key = CACHE_KEYS.USER_SEARCH(query);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached user search:', error);
      return null;
    }
  }

  // Cache user by email
  static async cacheUserByEmail(email: string, user: any): Promise<void> {
    try {
      const key = CACHE_KEYS.USER_BY_EMAIL(email);
      await redis.setex(key, CACHE_TTL.USER_BY_EMAIL, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to cache user by email:', error);
    }
  }

  // Get cached user by email
  static async getUserByEmail(email: string): Promise<any | null> {
    try {
      const key = CACHE_KEYS.USER_BY_EMAIL(email);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached user by email:', error);
      return null;
    }
  }

  // Invalidate user caches (when user data changes)
  static async invalidateUserCaches(userId: string, email?: string): Promise<void> {
    try {
      const pipeline = redis.pipeline();
      
      // Remove all user search caches (could be optimized with patterns)
      const searchKeys = await redis.keys(CACHE_KEYS.USER_SEARCH('*'));
      if (searchKeys.length > 0) {
        pipeline.del(...searchKeys);
      }

      // Remove specific email cache if provided
      if (email) {
        pipeline.del(CACHE_KEYS.USER_BY_EMAIL(email));
      }

      await pipeline.exec();
    } catch (error) {
      console.warn('Failed to invalidate user caches:', error);
    }
  }
}

export { redis };
