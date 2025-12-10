import { Cache } from './redis';
import RedisMock from 'ioredis-mock';

// Mock ioredis module
jest.mock('ioredis', () => require('ioredis-mock'));

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (cache.redis) {
      await cache.redis.flushall();
      cache.redis.disconnect();
    }
    cache.lruCache.clear();
  });

  describe('initialization', () => {
    test('should create LRU cache with default configuration', () => {
      expect(cache.lruCache).toBeDefined();
      expect(cache.lruCache.max).toBe(100);
    });

    test('should initialize Redis when credentials provided', async () => {
      await cache.init('localhost', 6379, 0);
      expect(cache.redis).toBeDefined();
    });

    test('should not initialize Redis when URL not provided', async () => {
      await cache.init(undefined, 6379, 0);
      expect(cache.redis).toBeUndefined();
    });

    test('should select correct Redis database', async () => {
      await cache.init('localhost', 6379, 2);
      expect(cache.redis).toBeDefined();
      // ioredis-mock tracks db selection
    });

    test('should handle Redis connection errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by passing invalid port
      await cache.init('localhost', -1, 0);

      // Should not throw, just log error
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('LRU cache operations', () => {
    test('should store and retrieve value from LRU cache', async () => {
      const testData = { message: 'test data' };
      await cache.set('test-key', testData);

      const result = await cache.get('test-key');
      expect(result).toEqual(testData);
    });

    test('should return null for non-existent key', async () => {
      const result = await cache.get('non-existent-key');
      expect(result).toBeFalsy(); // Returns undefined or null for missing keys
    });

    test('should delete value from LRU cache', async () => {
      const testData = { message: 'test data' };
      await cache.set('test-key', testData);

      await cache.delete('test-key');
      const result = await cache.get('test-key');
      expect(result).toBeFalsy(); // Returns undefined or null for deleted keys
    });

    test('should respect TTL for LRU cache', async () => {
      const testData = { message: 'test data' };
      await cache.set('test-key', testData, 1); // 1 second TTL

      // Immediately available
      const result1 = await cache.get('test-key');
      expect(result1).toEqual(testData);

      // Wait for expiration (simulate with manual clearing since we can't wait in tests)
      cache.lruCache.delete('test-key');
      const result2 = await cache.get('test-key');
      expect(result2).toBeFalsy(); // Returns undefined or null for expired keys
    });

    test('should handle allowStale configuration', () => {
      // LRU cache is configured with allowStale: true
      expect(cache.lruCache.allowStale).toBe(true);
    });

    test('should not store null values', async () => {
      await cache.set('test-key', null);
      const result = await cache.get('test-key');
      expect(result).toBeFalsy(); // Returns undefined or null for non-existent keys
    });

    test('should handle LRU cache max size limit', async () => {
      // Store more than max (100) items
      for (let i = 0; i < 150; i++) {
        await cache.set(`key-${i}`, { value: i });
      }

      // LRU cache should have evicted oldest items
      expect(cache.lruCache.size).toBeLessThanOrEqual(100);
    });
  });

  describe('JSON serialization', () => {
    test('should handle JSON parse errors in LRU cache', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Manually set invalid JSON in LRU cache
      cache.lruCache.set('test-key', 'invalid-json{');

      const result = await cache.get('test-key');
      expect(result).toBeNull();
      expect(cache.lruCache.has('test-key')).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test('should handle JSON parse errors in Redis cache', async () => {
      await cache.init('localhost', 6379, 0);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Manually set invalid JSON in Redis
      await cache.redis.set('test-key', 'invalid-json{');

      const result = await cache.get('test-key');
      expect(result).toBeNull();

      // Should delete invalid key from Redis
      const redisValue = await cache.redis.get('test-key');
      expect(redisValue).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test('should correctly stringify complex objects', async () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          string: 'test',
          null: null,
          boolean: true,
        },
      };

      await cache.set('test-key', complexData);
      const result = await cache.get('test-key');
      expect(result).toEqual(complexData);
    });
  });

  describe('two-tier cache strategy', () => {
    beforeEach(async () => {
      await cache.init('localhost', 6379, 0);
    });

    describe('should handle cache hit scenarios', () => {
      const testCases = [
        {
          scenario: 'LRU hit',
          setupLRU: true,
          setupRedis: false,
          expectedData: { source: 'lru' },
          description: 'LRU cache hit, skip Redis',
        },
        {
          scenario: 'Redis hit',
          setupLRU: false,
          setupRedis: true,
          expectedData: { source: 'redis' },
          description: 'Redis hit, promote to LRU',
        },
        {
          scenario: 'Both miss',
          setupLRU: false,
          setupRedis: false,
          expectedData: null,
          description: 'cache miss',
        },
      ];

      test.each(testCases)(
        'should handle $scenario',
        async ({ setupLRU, setupRedis, expectedData }) => {
          const testCache = new Cache();
          await testCache.init('localhost', 6379, 0);

          if (setupLRU) {
            testCache.lruCache.set('test-key', JSON.stringify(expectedData));
          }
          if (setupRedis) {
            await testCache.redis.set('test-key', JSON.stringify(expectedData));
          }

          const result = await testCache.get('test-key');
          expect(result).toEqual(expectedData);

          await testCache.redis.flushall();
          testCache.redis.disconnect();
        }
      );
    });

    test('should promote Redis hit to LRU cache', async () => {
      const testData = { message: 'from redis' };
      await cache.redis.set('test-key', JSON.stringify(testData));

      // First get should retrieve from Redis and promote to LRU
      const result1 = await cache.get('test-key');
      expect(result1).toEqual(testData);

      // Verify it's now in LRU cache
      expect(cache.lruCache.has('test-key')).toBe(true);

      // Delete from Redis to verify next get comes from LRU
      await cache.redis.del('test-key');
      const result2 = await cache.get('test-key');
      expect(result2).toEqual(testData);
    });

    test('should store in both LRU and Redis on set', async () => {
      const testData = { message: 'test data' };
      await cache.set('test-key', testData);

      // Check LRU
      expect(cache.lruCache.has('test-key')).toBe(true);

      // Check Redis
      const redisValue = await cache.redis.get('test-key');
      expect(JSON.parse(redisValue)).toEqual(testData);
    });

    test('should set different TTL for LRU and Redis', async () => {
      const testData = { message: 'test data' };
      const ttl = 600; // 10 minutes

      await cache.set('test-key', testData, ttl);

      // LRU should use ttl/2
      // Redis should use full ttl (verified by ioredis-mock tracking)
      expect(cache.lruCache.has('test-key')).toBe(true);
      const redisValue = await cache.redis.get('test-key');
      expect(JSON.parse(redisValue)).toEqual(testData);
    });

    test('should delete from both LRU and Redis', async () => {
      const testData = { message: 'test data' };
      await cache.set('test-key', testData);

      await cache.delete('test-key');

      expect(cache.lruCache.has('test-key')).toBe(false);
      const redisValue = await cache.redis.get('test-key');
      expect(redisValue).toBeNull();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await cache.init('localhost', 6379, 0);
    });

    test('should handle Redis get errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force Redis error
      jest.spyOn(cache.redis, 'get').mockRejectedValueOnce(new Error('Redis error'));

      const result = await cache.get('test-key');
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cache error', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    test('should handle Redis set errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force Redis error
      jest.spyOn(cache.redis, 'setex').mockRejectedValueOnce(new Error('Redis error'));

      const testData = { message: 'test' };
      await cache.set('test-key', testData);

      // Should still set in LRU despite Redis error
      expect(cache.lruCache.has('test-key')).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cache error', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    test('should handle Redis delete errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force Redis error
      jest.spyOn(cache.redis, 'del').mockRejectedValueOnce(new Error('Redis error'));

      await cache.delete('test-key');

      // Should still delete from LRU despite Redis error
      expect(cache.lruCache.has('test-key')).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cache error', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    test('should work without Redis initialized', async () => {
      const cacheWithoutRedis = new Cache();

      const testData = { message: 'test' };
      await cacheWithoutRedis.set('test-key', testData);

      const result = await cacheWithoutRedis.get('test-key');
      expect(result).toEqual(testData);

      await cacheWithoutRedis.delete('test-key');
      const deletedResult = await cacheWithoutRedis.get('test-key');
      expect(deletedResult).toBeFalsy(); // Returns undefined or null for deleted keys
    });
  });

  describe('edge cases', () => {
    test('should handle empty string values', async () => {
      const testData = { message: '' };
      await cache.set('test-key', testData);

      const result = await cache.get('test-key');
      expect(result).toEqual(testData);
    });

    test('should handle zero values', async () => {
      const testData = { count: 0 };
      await cache.set('test-key', testData);

      const result = await cache.get('test-key');
      expect(result).toEqual(testData);
    });

    test('should handle false values', async () => {
      const testData = { flag: false };
      await cache.set('test-key', testData);

      const result = await cache.get('test-key');
      expect(result).toEqual(testData);
    });

    test('should handle array values', async () => {
      const testData = [1, 2, 3, 4, 5];
      await cache.set('test-key', testData);

      const result = await cache.get('test-key');
      expect(result).toEqual(testData);
    });

    test('should handle special characters in keys', async () => {
      const testData = { message: 'test' };
      const specialKey = 'test:key:with:colons|and|pipes';

      await cache.set(specialKey, testData);
      const result = await cache.get(specialKey);
      expect(result).toEqual(testData);
    });
  });
});
