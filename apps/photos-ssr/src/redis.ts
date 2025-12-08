import LRUCache from 'lru-cache';
import Redis from 'ioredis';


export class Cache {
   redis: Redis
   lruCache: LRUCache<string, string>
   constructor() {
        this.lruCache = new LRUCache({max: 10,
  ttl: 1000 * 60,
  allowStale : true })
   }
   async init(redisUrl?: string, redisPort?: number, redisDB?: number) {
        if (!redisUrl) {
            console.warn('No redis cache')
            return
        }
        try {
            this.redis = new Redis(redisPort, redisUrl)
            this.redis.select(redisDB)
        } catch(err) {
            console.error('Redis error', err)
        }
    }
  async get(key:string) {
    let val = this.lruCache.get(key);
    if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        console.error(`Failed to parse JSON from LRU cache for key "${key}". Value preview: "${val?.substring(0, 100)}". Error: ${e.message}`);
        this.lruCache.delete(key);
        return null;
      }
    }

    if (this.redis) {
        try {
            val = await this.redis.get(key);
            if (val) {
                try {
                  const parsed = JSON.parse(val);
                  this.lruCache.set(key, val);
                  return parsed;
                } catch (parseError) {
                  console.error(`Failed to parse JSON from Redis cache for key "${key}". Value preview: "${val?.substring(0, 100)}". Error: ${parseError.message}`);
                  await this.redis.del(key);
                  return null;
                }
            }
            return null;
        } catch (e) {
            console.error('Cache error', e)
            return null;
        }
    }
  }

  async set(key:string, val:any, ttl?:number) {
    ttl = ttl || 600
    if (!val) {
        return
    }
    let valDB = JSON.stringify(val)
    this.lruCache.set(key, valDB, {ttl: ttl /2});
    if (!this.redis) {
        return
    }
    try {
      await this.redis.setex(key, ttl, valDB)
    } catch (e) {
      console.error('Cache error', e)
    }
  }

  async delete(key: string) {
    this.lruCache.delete(key)
    if (!this.redis) {
        return
    }
    try {
      await this.redis.del(key)
    } catch (e) {
      console.error('Cache error', e)
    }
  }
}
