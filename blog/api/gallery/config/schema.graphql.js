const { getStoragePath, base64Url } = require('../../../lib/index');
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
          const key = "gallery:" + options.slug;
          let gallery = await strapi.services.cache.get(key)
          if (gallery) {
             return gallery; 
          }
          gallery = await strapi.services.gallery.findOne({ slug: options.slug});
          
          if (!gallery) {
            return new UserInputError('unable to find gallery')
          }
          strapi.services.cache.set(key, gallery, 600);
          return gallery;
        }
      },
      galleryMenu: {
        resolverOf: 'application::gallery.gallery.findOne',
        resolver: async (obj, options, { context }, info) => {
          const key = "galleryMenu:v2" + options.slug;
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          let result = await strapi.services.cache.get(key)
           if (result) {
             return result;
           }

          const gallery = await strapi.services.gallery.findOne({ slug: options.slug});
          if (!gallery) {
            return new UserInputError('unable to find gallery')
          }

          const categories = await strapi.services.category.find({ 'gallery.id': gallery.id, _sort: 'id:desc', _limit: 100, publicationDate_lt: new Date()});
          strapi.services.cache.set(key, {
            gallery,
            categories
          }, 600)
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
