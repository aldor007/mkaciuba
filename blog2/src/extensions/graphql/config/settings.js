const apolloServerPluginResponseCache = require('apollo-server-plugin-response-cache')
const { RedisCache } = require('apollo-server-cache-redis')

// set this to whatever you believe should be the max age for your cache control
const MAX_AGE = 3600

module.exports = {
  federation: false,
  apolloServer: {
    tracing: 'production' !== strapi.config.environment ? true : false,
    persistedQueries: { ttl: 10 * MAX_AGE }, // we set this to be a factor of 10, somewhat arbitrary
    cacheControl: { defaultMaxAge: MAX_AGE },
    plugins: [
      apolloServerPluginResponseCache({
        shouldReadFromCache,
        shouldWriteToCache,
        extraCacheKeyData,
        sessionId,
      }),
      injectCacheControl()
    ]
  },
  context: ({ req }) => {
   const auth = req.headers.authorization || '';
   const parts = auth.split(' ');
   if (parts.length != 2) {
     return
   }
   const token = parts[1];
   // Add the user to the context
   return { token};
 },
}

const cache = new RedisCache({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST,
  family: 4, // 4 (IPv4) or 6 (IPv6)
  db: process.env.REDIS_DB,
})
module.exports.apolloServer.cache = cache
module.exports.apolloServer.persistedQueries.cache = cache

async function sessionId({ context }) {
  // return a session ID here, if there is one for this request
  return context.context.request.headers['x-gallery-token'];
}

async function shouldReadFromCache({ context }) {
  // decide if we should write to the cache in this request
  if (context.context.request.headers['x-gallery-token']) {
    return false;
  }

  if (context.context.request.headers['x-debug']) {
    return false;
  }

  return true
}

async function shouldWriteToCache({ context}) {
  // decide if we should write to the cache in this request
  if (context.context.request.headers['x-gallery-token']) {
    return false;
  }

  if (context.context.request.headers['x-debug']) {
    return false;
  }

  return true
}

async function extraCacheKeyData(requestContext) {
  // use this to create any extra data that can be used for the cache key
}

function injectCacheControl() {
  return {
    requestDidStart(requestContext) {
      const { context } = requestContext;
    }
  }
}


