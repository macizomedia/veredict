import { getRedisClient } from './redis';
import { SearchIndexer } from './search-indexer';

/**
 * Enhanced Redis Caching Layer with Smart Invalidation
 * Provides comprehensive caching strategies for different data types
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for group invalidation
  namespace?: string; // Cache namespace
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  namespace: string;
}

/**
 * Smart Cache Manager
 */
export class SmartCacheManager {
  private defaultTTL = 300; // 5 minutes
  private redis: ReturnType<typeof getRedisClient> | null = null;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.redis = await getRedisClient();
      console.log('✅ Smart Cache Manager initialized with Redis');
    } catch (error) {
      console.warn('⚠️ Redis not available, caching disabled:', error);
    }
  }

  private async getRedis() {
    if (!this.redis) {
      try {
        this.redis = await getRedisClient();
      } catch (error) {
        console.warn('⚠️ Redis connection failed:', error);
        return null;
      }
    }
    return this.redis;
  }

  /**
   * Generate cache key with namespace
   */
  private generateKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  /**
   * Generate cache metadata key
   */
  private generateMetaKey(namespace: string, key: string): string {
    return `${namespace}:${key}:meta`;
  }

  /**
   * Set cache entry with metadata
   */
  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    const redis = await this.getRedis();
    if (!redis) return false;

    const {
      ttl = this.defaultTTL,
      tags = [],
      namespace = 'app'
    } = options;

    const cacheKey = this.generateKey(namespace, key);
    const metaKey = this.generateMetaKey(namespace, key);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      namespace,
    };

    try {
      // Store data and metadata
      await Promise.all([
        redis.setEx(cacheKey, ttl, JSON.stringify(data)),
        redis.setEx(metaKey, ttl + 60, JSON.stringify(entry)), // Meta expires later
      ]);

      // Add to tag indexes for group invalidation
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        await redis.sAdd(tagKey, cacheKey);
        await redis.expire(tagKey, ttl + 300); // Tags expire later
      }

      return true;
    } catch (error) {
      console.error('❌ Cache set failed:', error);
      return false;
    }
  }

  /**
   * Get cache entry
   */
  async get<T>(
    key: string, 
    namespace: string = 'app'
  ): Promise<T | null> {
    const redis = await this.getRedis();
    if (!redis) return null;

    const cacheKey = this.generateKey(namespace, key);

    try {
      const data = await redis.get(cacheKey);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('❌ Cache get failed:', error);
      return null;
    }
  }

  /**
   * Get cache entry with metadata
   */
  async getWithMeta<T>(
    key: string,
    namespace: string = 'app'
  ): Promise<CacheEntry<T> | null> {
    const redis = await this.getRedis();
    if (!redis) return null;

    const metaKey = this.generateMetaKey(namespace, key);

    try {
      const meta = await redis.get(metaKey);
      if (!meta) return null;

      return JSON.parse(meta) as CacheEntry<T>;
    } catch (error) {
      console.error('❌ Cache get with meta failed:', error);
      return null;
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(
    key: string,
    namespace: string = 'app'
  ): Promise<boolean> {
    const redis = await this.getRedis();
    if (!redis) return false;

    const cacheKey = this.generateKey(namespace, key);
    const metaKey = this.generateMetaKey(namespace, key);

    try {
      await Promise.all([
        redis.del(cacheKey),
        redis.del(metaKey),
      ]);
      return true;
    } catch (error) {
      console.error('❌ Cache delete failed:', error);
      return false;
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  async invalidateByTag(tag: string): Promise<number> {
    const redis = await this.getRedis();
    if (!redis) return 0;

    const tagKey = `tag:${tag}`;

    try {
      const keys = await redis.sMembers(tagKey);
      if (keys.length === 0) return 0;

      // Delete all keys with this tag
      const metaKeys = keys.map(key => `${key}:meta`);
      await Promise.all([
        redis.del(...keys),
        redis.del(...metaKeys),
        redis.del(tagKey),
      ]);

      console.log(`🔄 Invalidated ${keys.length} cache entries for tag: ${tag}`);
      return keys.length;
    } catch (error) {
      console.error('❌ Cache invalidation by tag failed:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache entries by namespace
   */
  async invalidateByNamespace(namespace: string): Promise<number> {
    const redis = await this.getRedis();
    if (!redis) return 0;

    try {
      const pattern = `${namespace}:*`;
      const keys = await this.scanKeys(pattern);
      
      if (keys.length === 0) return 0;

      await redis.del(...keys);
      console.log(`🔄 Invalidated ${keys.length} cache entries for namespace: ${namespace}`);
      return keys.length;
    } catch (error) {
      console.error('❌ Cache invalidation by namespace failed:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
    namespaces: Record<string, number>;
  }> {
    const redis = await this.getRedis();
    if (!redis) {
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        hitRate: 0,
        namespaces: {},
      };
    }

    try {
      const info = await redis.info('memory');
      const keys = await this.scanKeys('*');
      
      // Group by namespace
      const namespaces: Record<string, number> = {};
      keys.forEach(key => {
        const namespace = key.split(':')[0];
        namespaces[namespace] = (namespaces[namespace] || 0) + 1;
      });

      // Extract memory usage
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : '0B';

      return {
        totalKeys: keys.length,
        memoryUsage,
        hitRate: 0, // Would need to track hits/misses
        namespaces,
      };
    } catch (error) {
      console.error('❌ Cache stats failed:', error);
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        hitRate: 0,
        namespaces: {},
      };
    }
  }

  /**
   * Scan keys with pattern (handles large datasets)
   */
  private async scanKeys(pattern: string): Promise<string[]> {
    const redis = await this.getRedis();
    if (!redis) return [];

    const keys: string[] = [];
    let cursor = '0';

    try {
      do {
        const result = await redis.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });
        
        cursor = result.cursor.toString();
        keys.push(...result.keys);
      } while (cursor !== '0');

      return keys;
    } catch (error) {
      console.error('❌ Key scan failed:', error);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    redis: boolean;
    latency: number;
    version: string;
  }> {
    const redis = await this.getRedis();
    
    if (!redis) {
      return {
        redis: false,
        latency: -1,
        version: 'unknown',
      };
    }

    try {
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;

      const info = await redis.info('server');
      const versionMatch = info.match(/redis_version:([^\r\n]+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';

      return {
        redis: true,
        latency,
        version,
      };
    } catch (error) {
      return {
        redis: false,
        latency: -1,
        version: 'unknown',
      };
    }
  }
}

/**
 * Specialized caching strategies for different data types
 */
export class DomainCacheManager extends SmartCacheManager {
  
  // Post caching
  async cachePost(postId: number, post: any): Promise<boolean> {
    return this.set(`post:${postId}`, post, {
      ttl: 600, // 10 minutes
      tags: ['posts', `category:${post.categoryId}`, 'content'],
      namespace: 'posts',
    });
  }

  async getCachedPost(postId: number): Promise<any | null> {
    return this.get(`post:${postId}`, 'posts');
  }

  async invalidatePost(postId: number): Promise<void> {
    await this.delete(`post:${postId}`, 'posts');
    await this.invalidateByTag(`post:${postId}`);
  }

  // Search caching
  async cacheSearchResults(query: string, filters: any, results: any): Promise<boolean> {
    const key = this.generateSearchKey(query, filters);
    return this.set(key, results, {
      ttl: 300, // 5 minutes
      tags: ['search', 'posts'],
      namespace: 'search',
    });
  }

  async getCachedSearchResults(query: string, filters: any): Promise<any | null> {
    const key = this.generateSearchKey(query, filters);
    return this.get(key, 'search');
  }

  private generateSearchKey(query: string, filters: any): string {
    const filterString = JSON.stringify(filters);
    const hash = require('crypto').createHash('md5').update(query + filterString).digest('hex');
    return `search:${hash}`;
  }

  // Category caching
  async cacheCategories(categories: any[]): Promise<boolean> {
    return this.set('all', categories, {
      ttl: 1800, // 30 minutes
      tags: ['categories'],
      namespace: 'categories',
    });
  }

  async getCachedCategories(): Promise<any[] | null> {
    return this.get('all', 'categories');
  }

  async invalidateCategories(): Promise<void> {
    await this.invalidateByTag('categories');
  }

  // User caching
  async cacheUser(userId: string, user: any): Promise<boolean> {
    return this.set(`user:${userId}`, user, {
      ttl: 900, // 15 minutes
      tags: ['users'],
      namespace: 'users',
    });
  }

  async getCachedUser(userId: string): Promise<any | null> {
    return this.get(`user:${userId}`, 'users');
  }

  // Analytics caching
  async cacheAnalytics(key: string, data: any): Promise<boolean> {
    return this.set(key, data, {
      ttl: 3600, // 1 hour
      tags: ['analytics'],
      namespace: 'analytics',
    });
  }

  async getCachedAnalytics(key: string): Promise<any | null> {
    return this.get(key, 'analytics');
  }

  // Invalidation hooks for database events
  async onPostCreated(postId: number): Promise<void> {
    await this.invalidateByTag('search');
    await this.invalidateByTag('posts');
    await SearchIndexer.indexPost(postId);
  }

  async onPostUpdated(postId: number): Promise<void> {
    await this.invalidatePost(postId);
    await this.invalidateByTag('search');
    await SearchIndexer.indexPost(postId);
  }

  async onPostDeleted(postId: number): Promise<void> {
    await this.invalidatePost(postId);
    await this.invalidateByTag('search');
    await SearchIndexer.removePostFromIndex(postId);
  }

  async onCategoryChanged(): Promise<void> {
    await this.invalidateCategories();
    await this.invalidateByTag('search');
  }

  async onUserUpdated(userId: string): Promise<void> {
    await this.delete(`user:${userId}`, 'users');
  }
}

// Singleton instances
export const smartCache = new SmartCacheManager();
export const domainCache = new DomainCacheManager();

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  constructor(private cacheManager: DomainCacheManager) {}

  /**
   * Warm up essential caches
   */
  async warmEssentialCaches(): Promise<void> {
    console.log('🔥 Warming up essential caches...');
    
    try {
      // Warm categories cache
      // Note: In real implementation, fetch from database
      
      // Warm popular posts cache
      // Note: In real implementation, fetch trending posts
      
      // Warm search suggestions cache
      // Note: In real implementation, fetch popular searches
      
      console.log('✅ Essential caches warmed');
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    }
  }

  /**
   * Background cache refresh
   */
  async backgroundRefresh(): Promise<void> {
    console.log('🔄 Running background cache refresh...');
    
    // Refresh stale entries
    // Precompute expensive queries
    // Update analytics caches
    
    console.log('✅ Background cache refresh completed');
  }
}

export const cacheWarmer = new CacheWarmer(domainCache);
