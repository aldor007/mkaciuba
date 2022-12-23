/**
 * Module dependencies
 */

// Public
const LRU = require("lru-cache");
const Redis  = require('node-cache-redis');
const lruCache = new LRU({ max: 30, maxAge: 1000 * 60  });

class Cache {
  async get(key) {
    let val = lruCache.get(key);
    if (val) {
      return val;
    }

    try {
      val = await Redis.get(key);
      lruCache.set(val)
      return val;
    } catch (e) {
      console.error('Cache error', e)
      return null;
    }
  }

  async set(key, val, ttl) {
    lruCache.set(key, val);
    try {
      await Redis.set(key, val, ttl || 120)
    } catch (e) {
      console.error('Cache error', e)
    }
  }
}


module.exports = function(strapi) {
  const hook = {

    /**
     * Initialize the hook
     */

    async initialize() {
      const { config } = strapi.config.hook.settings['cache'];
      Redis.init({
        name: 'strapi',
        redisOptions: {
          host: config.host,
          port: config.port,
          db: config.db
        },
        poolOptions: {
          min: 3,
          max: 10,
          acquireTimeoutMillis: 100,
        },
        // logger: strapi.log
      })
      strapi.services.cache = new Cache();
    },
  };

  return hook;
};