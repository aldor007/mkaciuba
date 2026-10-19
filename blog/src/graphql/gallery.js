'use strict';

const { UserInputError } = require('apollo-server-koa');
const cache = require('../utils/cache');
const { setCacheHint } = require('./utils');

const GALLERY_UID = 'api::gallery.gallery';
const CATEGORY_UID = 'api::category.category';

/**
 * GalleryCategories type + galleryBySlug / galleryMenu queries (v3 port).
 */
module.exports = ({ nexus }) => {
  const GalleryExtensions = nexus.extendType({
    type: 'Gallery',
    definition(t) {
      t.nonNull.id('id');
    },
  });

  const GalleryCategories = nexus.objectType({
    name: 'GalleryCategories',
    definition(t) {
      t.field('gallery', { type: 'Gallery' });
      t.list.field('categories', { type: 'Category' });
    },
  });

  const GalleryQueries = nexus.extendType({
    type: 'Query',
    definition(t) {
      t.field('galleryBySlug', {
        type: 'Gallery',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          const key = `gallery:${args.slug}`;
          let gallery = await cache.get(key);
          if (gallery) {
            return gallery;
          }
          const found = await strapi.entityService.findMany(GALLERY_UID, {
            filters: { slug: args.slug },
            limit: 1,
          });
          gallery = found && found[0];
          if (!gallery) {
            return new UserInputError('unable to find gallery');
          }
          await cache.set(key, gallery, 600);
          return gallery;
        },
      });

      t.field('galleryMenu', {
        type: 'GalleryCategories',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const key = `galleryMenu:v2${args.slug}`;
          let result = await cache.get(key);
          if (result) {
            return result;
          }
          const found = await strapi.entityService.findMany(GALLERY_UID, {
            filters: { slug: args.slug },
            limit: 1,
          });
          const gallery = found && found[0];
          if (!gallery) {
            return new UserInputError('unable to find gallery');
          }
          const categories = await strapi.entityService.findMany(CATEGORY_UID, {
            filters: {
              gallery: gallery.id,
              publicationDate: { $lt: new Date() },
            },
            orderBy: 'id:desc',
            limit: 100,
            populate: { image: true, gallery: true, file: true, medias: true },
          });
          result = { gallery, categories };
          await cache.set(key, result, 600);
          return result;
        },
      });
    },
  });

  return {
    types: [GalleryExtensions, GalleryCategories, GalleryQueries],
  };
};
