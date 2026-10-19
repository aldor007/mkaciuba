'use strict';

const apolloResponseCache = require('apollo-server-plugin-response-cache');
const { RedisCache } = require('apollo-server-cache-redis');

const MAX_AGE = 3600;

// Port of the v3 extensions/graphql/config/settings.js response cache:
// requests carrying x-gallery-token or x-debug must bypass the cache, and
// gallery-token sessions are part of the cache key.
async function sessionId(requestContext) {
  return requestContext.request.http.headers.get('x-gallery-token');
}

async function shouldReadFromCache(requestContext) {
  if (requestContext.request.http.headers.get('x-gallery-token')) {
    return false;
  }
  if (requestContext.request.http.headers.get('x-debug')) {
    return false;
  }
  return true;
}

async function shouldWriteToCache(requestContext) {
  if (requestContext.request.http.headers.get('x-gallery-token')) {
    return false;
  }
  if (requestContext.request.http.headers.get('x-debug')) {
    return false;
  }
  return true;
}

function buildApolloServerConfig() {
  const responseCachePlugin = apolloResponseCache.default || apolloResponseCache;

  const config = {
    tracing: process.env.NODE_ENV !== 'production',
    cacheControl: { defaultMaxAge: MAX_AGE },
    plugins: [
      responseCachePlugin({
        sessionId,
        shouldReadFromCache,
        shouldWriteToCache,
      }),
    ],
  };

  if (process.env.REDIS_HOST) {
    const redisCache = new RedisCache({
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      host: process.env.REDIS_HOST,
      family: 4,
      db: parseInt(process.env.REDIS_DB || '1', 10),
    });
    config.cache = redisCache;
    config.persistedQueries = { ttl: 10 * MAX_AGE, cache: redisCache };
  }

  return config;
}

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-mort',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
  graphql: {
    config: {
      amountLimit: 30,
      defaultLimit: 30,
      depthLimit: 7,
      apolloServer: buildApolloServerConfig(),
    },
  },
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
});
