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
      return JSON.parse(val);
    }

    if (this.redis) {
        try {
            val = await this.redis.get(key);
            if (val) {
                this.lruCache.set(key, val)
            }
            return JSON.parse(val);
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
