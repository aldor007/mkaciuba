'use strict';

/**
 * Port of the v3 hooks/cache service (LRU + node-cache-redis).
 * v3 exposed it as strapi.services.cache; here it is a module singleton.
 * Redis failures degrade gracefully (v3 logged and returned null).
 */

const LRU = require('lru-cache');
const NodeCacheRedis = require('node-cache-redis');

const lruCache = new LRU({ max: 30, maxAge: 1000 * 60 });

let initialized = false;

function initCache() {
  if (initialized) return;
  initialized = true;
  try {
    NodeCacheRedis.init({
      name: 'strapi',
      redisOptions: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        db: parseInt(process.env.REDIS_DB || '1', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
      poolOptions: {
        min: 3,
        max: 10,
        acquireTimeoutMillis: 100,
      },
    });
  } catch (e) {
    console.error('Cache init error', e);
  }
}

class Cache {
  async get(key) {
    const val = lruCache.get(key);
    if (val) {
      return val;
    }
    try {
      initCache();
      const val = await NodeCacheRedis.get(key);
      if (val) {
        lruCache.set(key, val);
      }
      return val;
    } catch (e) {
      console.error('Cache error', e);
      return null;
    }
  }

  async set(key, val, ttl) {
    // Never cache null/undefined — node_redis rejects non-string values
    // (SETEX with null crashes), and empty single types must stay uncached
    // so they are re-read after creation.
    if (val == null) {
      return;
    }
    lruCache.set(key, val);
    try {
      initCache();
      await NodeCacheRedis.set(key, val, ttl || 120);
    } catch (e) {
      console.error('Cache error', e);
    }
  }
}

module.exports = new Cache();
