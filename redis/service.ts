import { connectRedis } from './redis';

export class CacheService {
  static async get(key: string) {
    const redis = await connectRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  static async set(key: string, value: any, ttl: number = 300) {
    const redis = await connectRedis();
    await redis.setEx(key, ttl, JSON.stringify(value));
  }

  static async del(key: string) {
    const redis = await connectRedis();
    await redis.del(key);
  }

  static async clearPattern(pattern: string) {
    const redis = await connectRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  // Product-specific cache methods
  static getProductCacheKey(storeId: string, page: number, limit: number, category?: string, status?: string) {
    return `products:${storeId}:${page}:${limit}:${category || 'all'}:${status || 'all'}`;
  }

  static async clearProductCache(storeId: string) {
    await this.clearPattern(`products:${storeId}:*`);
  }
}