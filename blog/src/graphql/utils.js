'use strict';

/**
 * Shared helpers for the custom GraphQL layer.
 */

/**
 * Translate a v3-style `where` JSON object (flat _suffix operators,
 * e.g. publicationDate_lt, id_ne, tags_in, keywords_contains, slug)
 * into v4 query-engine filter syntax ({ field: { $lt: ... } }).
 */
function translateWhere(where = {}) {
  const out = {};
  for (const [key, value] of Object.entries(where || {})) {
    const m = key.match(/^(.*?)_(lt|lte|gt|gte|ne|in|nin|contains|ncontains|containsi|ncontainsi|null)$/);
    if (m && m[1]) {
      const field = m[1];
      const op = `$${m[2]}`;
      if (op === '$null') {
        out[field] = value ? { $null: true } : { $notNull: true };
      } else {
        out[field] = { ...(out[field] || {}), [op]: value };
      }
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * v3-style cache-key builder used by the custom resolvers.
 */
function getCacheKey(prefix, options = {}, obj = {}) {
  if (options.where) {
    prefix += JSON.stringify(options.where);
  }
  if (options.filters) {
    prefix += JSON.stringify(options.filters);
  }
  if (options.id_in) {
    prefix += JSON.stringify(options.id_in);
  }
  if (options.slug) {
    prefix += options.slug;
  }
  return `${prefix}:${options.limit}:${options.sort}:${obj.id}`;
}

/**
 * Set an Apollo cache hint if the cache-control surface is available.
 */
function setCacheHint(info, hint) {
  if (info && info.cacheControl && typeof info.cacheControl.setCacheHint === 'function') {
    info.cacheControl.setCacheHint(hint);
  }
}

/**
 * Read a header from the v4 GraphQL resolver context (Koa ctx).
 */
function getHeader(context, name) {
  const koa = (context && context.koaContext) || context;
  if (!koa) return undefined;
  if (typeof koa.get === 'function') return koa.get(name);
  const headers = (koa.request && koa.request.headers) || koa.headers || {};
  return headers[name];
}

module.exports = {
  translateWhere,
  getCacheKey,
  setCacheHint,
  getHeader,
};
