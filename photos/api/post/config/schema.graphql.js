const { getStoragePath, base64Url } = require('../../../lib/index');
const slugify = require('slugify');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');

const getCacheKey = (prefix, options = {}, obj = {}) => {
  if (options.where) {
    prefix += JSON.stringify(options.where);
  }
  if (options.id_in) {
    prefix += JSON.stringify(options.id_in)
  }
  if (options.slug) {
    prefix += options.slug;
  }
  return `${prefix}:${options.limit}:${options.sort}:${obj.id}`;
}
module.exports = {
    definition: `
    extend type Query {
      postsCount(where: JSON): Int!
  }
  `,
  resolver: {
    Query: {
      post: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = options.where || {};
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          search._limit =  options.limit;
          search._start = options.start || 0;
          search._sort = options.sort || 'id:desc'
          search.publicationDate_lt = new Date();
          const key = getCacheKey('categories' + search.publicationDate_lt, options);
          let categories = await strapi.services.cache.get(key)
          if (categories) {
            return categories.length;
          }
           return await strapi.services.category.count(search || {});
        }
      },
      posts: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = {};
          search._limit =  options.limit;
          search._start = options.start || 0;
          search._sort = options.sort || 'id:desc'
          search.publicationDate_lt = new Date();
          const key = getCacheKey('posts' + search.publicationDate_lt, options);
          // let posts = await strapi.services.cache.get(key)
          // // info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          // if (posts) {
          //   return posts;
          // }
          strapi.log.debug('dupa;', search)
          let posts = await strapi.services.post.find(search);
          // strapi.services.cache.set(key, posts, 60*60);
          return posts;
        }
      },
      postsCount: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = {};
          search._limit =  options.limit;
          search._start = options.start || 0;
          search._sort = options.sort || 'id:desc'
          search.publicationDate_lt = new Date();
          const key = getCacheKey('posts' + search.publicationDate_lt, options);
          let posts = await strapi.services.cache.get(key)
          // info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          if (posts) {
            return posts.length;
          }
          return await strapi.services.post.count(search);
        }
      },
    },
  }
};
