const { getStoragePath, base64Url } = require('../../../lib/index');
const LRU = require("lru-cache");
const lruCache = new LRU({ max: 30, maxAge: 1000 * 60 * 10 });
const slugify = require('slugify');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-errors');

module.exports = {
    definition: `
    type GalleryCategories {
      gallery: Gallery
      categories: [Category]
    }
  extend type Query {
    galleryBySlug(slug: String): Gallery
    galleryMenu(slug: String): GalleryCategories
  }
  `,
  resolver: {
    Query: {
      gallery: false,
      galleries: false,
      galleryBySlug: {
        resolverOf: 'application::gallery.gallery.findOne',
        resolver: async (obj, options, { context }) => {
          const gallery = await strapi.services.gallery.findOne({ slug: options.slug});
          if (!gallery) {
            return new UserInputError('unable to find gallery')
          }
          return gallery;
        }
      },
      galleryMenu: {
        resolverOf: 'application::gallery.gallery.findOne',
        resolver: async (obj, options, { context }) => {
           if (lruCache.get(options.slug)) {
             return lruCache.get(options.slug)
           }

          const gallery = await strapi.services.gallery.findOne({ slug: options.slug});
          if (!gallery) {
            return new UserInputError('unable to find gallery')
          }

          const categories = await strapi.services.category.find({ 'gallery.id': gallery.id, _sort: 'id:desc', _limit: 100});
          lruCache.set(options.slug, {
            gallery,
            categories
          })
          return {
            gallery,
            categories
          };
        }
      }
    },
    Mutation: {
    }
  }
};
