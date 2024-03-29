const { getStoragePath, base64Url } = require('../../../lib/index');
const slugify = require('slugify');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-errors');
const jwt = require('jsonwebtoken');
const { getImage, getImagesFromPreset } = require('../../../lib/image');
const removeMd = require('remove-markdown');

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
      postBySlug(slug: String): Post
      postByPermalink(permalink: String): Post
      prevNextPost(slug: String): [Post]
      relatedPosts(slug: String): [Post]
    }
    extend type Post {
      mainImage: [Image]
      coverImage: [Image]
      seoDescription: String
    }
  `,
  resolver: {
    Post: {
      mainImage: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          if (!obj.image) {
            return null
          }
          return getImagesFromPreset(obj.image, obj.post_image_preset || 'postlist')
        }
      },
      coverImage: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          if (!obj.cover_image) {
            return null
          }
          return getImagesFromPreset(obj.cover_image, obj.cover_image_preset || 'coverimg')
        }
      },
      seoDescription: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          if (obj.content_type == "MARKDOWN") {
            return removeMd(obj.description);
          }

          return obj.description.replace(/&nbsp;/g, ' ').replace(/<.*?>/g, '')
        }
      }

    },
    Query: {
      post: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = options.where || {};
          info.cacheControl.setCacheHint({ maxAge: 86400, scope: 'PUBLIC' });
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
          const search = options.where || {};
          search._limit =  options.limit;
          search._start = options.start || 0;
          search._sort = options.sort || 'id:desc'
          search.publicationDate_lt = new Date();
          const key = getCacheKey('posts' + search.publicationDate_lt, options);
          info.cacheControl.setCacheHint({ maxAge: 3600, scope: 'PUBLIC' });
          let posts = await strapi.services.post.find(search);
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
      postBySlug: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = {};
          search.slug = options.slug
          post = await strapi.services.post.findOne(search);
          if (post) {
            if (new Date(post.publicationDate).getTime() < new Date().getTime()) {
              info.cacheControl.setCacheHint({ maxAge: 8640, scope: 'PUBLIC' });
            } else {
              info.cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });
            }
          }
          // post.gallery = await strapi.services.gallery.findOne({ id: post.gallery.id})
          return post;
        }
      },
      postByPermalink: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = {};
          search.publicationDate_lt = new Date();
          search.permalink = options.permalink
          const key = getCacheKey('post' + options.permalink, options);
          let post = await strapi.services.cache.get(key)
          // info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          if (post) {
            return post;
          }
          post = await strapi.services.post.findOne(search);
          // post.gallery = await strapi.services.gallery.findOne({ id: post.gallery.id})
          return post;
        }
      },
      prevNextPost: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = {};
          search.publicationDate_lt = new Date();
          search.slug = options.slug;
          const key = getCacheKey('post' + options.slug, options);
          let post = await strapi.services.cache.get(key)
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          post = await strapi.services.post.findOne(search);
          if (!post) {
            return [];
          }
          const search_lt = {
            id_lt: post.id,
            publicationDate_lt: search.publicationDate_lt,
            _sort: 'id:desc'
          }
          const search_gt = {
            id_gt: post.id,
            publicationDate_lt: search.publicationDate_lt,
            _sort: 'id:asc'
          }
          const post_lt = await strapi.services.post.findOne(search_lt);
          const post_gt = await strapi.services.post.findOne(search_gt);
          return [post_lt, post_gt];
        }
      },
      relatedPosts: {
        resolverOf: 'application::post.post.find',
        resolver: async (obj, options, { context }, info) => {
          const search = {};
          search.publicationDate_lt = new Date();
          search.slug = options.slug;
          const key = getCacheKey('post' + options.slug, options);
          let post = await strapi.services.cache.get(key)
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          post = await strapi.services.post.findOne(search);
          if (!post) {
            return [];
          }
          const search_related = {
            id_ne: post.id,
            publicationDate_lt: post.publicationDate,
            _sort: 'id:desc',
            _limit: 4,
          }
          if (post.keywords) {
            search_related.keywords_contains = post.keywords.slice(0, 10)
          }

          if (post.tags) {
            search_related.tags_in = post.tags.map(t => t.id)
          }

          const related = await strapi.services.post.find(search_related);
          return related
        }
      },
    },
  }
};
