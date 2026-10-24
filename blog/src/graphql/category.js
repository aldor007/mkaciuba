'use strict';

const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-koa');
const { getOriginalUrl } = require('../../lib/image');
const cache = require('../utils/cache');
const { translateWhere, getCacheKey, setCacheHint, getHeader } = require('./utils');

const CATEGORY_UID = 'api::category.category';

const POPULATE_CATEGORY_LIST = { image: true, gallery: true, file: true };
const POPULATE_CATEGORY_DETAIL = { image: true, gallery: true, file: true, medias: true };

async function findOneBySlug(strapi, slug, populate) {
  const found = await strapi.entityService.findMany(CATEGORY_UID, {
    filters: { slug },
    limit: 1,
    populate,
  });
  return found && found[0];
}

/**
 * Image type, Category field extensions, category queries and
 * validateTokenForCategory mutation (v3 port).
 *
 * Note: `categories` is a custom flat query (v3 shape: where/limit/start/sort
 * args, flat Category list) — the generated wrapper query is disabled.
 */
module.exports = ({ nexus }) => {
  const ValidationToken = nexus.objectType({
    name: 'ValidationToken',
    definition(t) {
      t.nonNull.boolean('valid');
      t.string('token');
    },
  });

  const CategoryExtensions = nexus.extendType({
    type: 'Category',
    definition(t) {
      t.nonNull.id('id');
      t.list.field('medias', {
        type: 'UploadFile',
        args: { start: 'Int', limit: 'Int', sort: 'String' },
        resolve(obj, args) {
          const medias = [...(obj.medias || [])];
          const sort = args.sort || 'id:desc';
          if (sort && sort !== 'id:desc') {
            const [field, direction = 'desc'] = sort.split(':');
            const dir = direction === 'asc' ? 1 : -1;
            medias.sort((a, b) => {
              const left = a?.[field] ?? 0;
              const right = b?.[field] ?? 0;
              if (left === right) return 0;
              return (left < right ? -1 : 1) * dir;
            });
          }
          const start = args.start || 0;
          const limit = args.limit;
          if (limit == null) {
            return medias;
          }
          return medias.slice(start, start + limit);
        },
      });
      t.field('randomImage', {
        type: 'UploadFile',
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const images = (obj.medias || []).filter((o) => o && o.id);
          if (!images.length) {
            return null;
          }
          const image = images[Math.floor(Math.random() * images.length)];
          return image;
        },
      });

      t.nonNull.int('mediasCount', {
        resolve(obj) {
          return (obj.medias || []).length;
        },
      });
    },
  });

  const CategoryQueries = nexus.extendType({
    type: 'Query',
    definition(t) {
      t.list.field('categories', {
        type: 'Category',
        args: { where: 'JSON', limit: 'Int', start: 'Int', sort: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          let categories = await strapi.entityService.findMany(CATEGORY_UID, {
            filters: {
              ...translateWhere(args.where),
              publicationDate: { $lt: new Date() },
              public: true,
              gallery: { $notNull: true },
            },
            sort: args.sort || 'id:desc',
            start: args.start || 0,
            limit: args.limit,
            populate: POPULATE_CATEGORY_LIST,
          });
          categories = (categories || []).map((c) => {
            c.file = null;
            return c;
          });
          return categories;
        },
      });

      t.field('categoryBySlug', {
        type: 'Category',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          const galleryToken = getHeader(context, 'x-gallery-token');
          const cacheKey = `categoryBySlugv2-${args.slug}|${galleryToken}`;
          let category = await cache.get(cacheKey);
          if (!category) {
            category = await findOneBySlug(strapi, args.slug, POPULATE_CATEGORY_DETAIL);
            if (category) {
              await cache.set(cacheKey, category, 60);
            }
          }

          if (!category) {
            return new UserInputError('unable to find category ');
          }

          if (!category.public) {
            const token = galleryToken;
            if (!token) {
              setCacheHint(info, { maxAge: 0, scope: 'PRIVATE' });
              return new AuthenticationError('auth required');
            }
            try {
              jwt.verify(token, category.token);
            } catch (e) {
              console.error('error ', args.slug, category.public, e);
              return new ForbiddenError('invalid token parse');
            }
            setCacheHint(info, { maxAge: 60, scope: 'PRIVATE' });
          } else {
            if (new Date(category.publicationDate).getTime() < Date.now()) {
              setCacheHint(info, { maxAge: 3600, scope: 'PUBLIC' });
            } else {
              setCacheHint(info, { maxAge: 60, scope: 'PRIVATE' });
            }
          }
          return category;
        },
      });

      t.field('recentImages', {
        type: nexus.list('UploadFile'),
        args: { limit: 'Int' },
        async resolve(obj, args, context, info) {
          if (args.limit > 9) {
            return new UserInputError('Has to be less than 9');
          }
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const key = getCacheKey('recentImages-v3', args);
          let images = await cache.get(key);
          if (images) {
            return images;
          }
          const categories = await strapi.entityService.findMany(CATEGORY_UID, {
            filters: {
              publicationDate: { $lt: new Date() },
              public: true,
              gallery: { $notNull: true },
            },
            sort: 'id:desc',
            limit: args.limit || 3,
            populate: { medias: true },
          });
          images = (categories || [])
            .map((c) => {
              const medias = c.medias || [];
              return medias[Math.floor(Math.random() * medias.length)];
            })
            .filter(Boolean);
          await cache.set(key, images, 600);
          return images;
        },
      });

      t.nonNull.int('categoriesCount', {
        args: { where: 'JSON' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const translated = translateWhere(args.where);
          const where = {
            ...translated,
            publicationDate: {
              ...(translated.publicationDate || {}),
              $lt: new Date(),
            },
            gallery: { $notNull: true },
          };
          return strapi.db.query(CATEGORY_UID).count({ where });
        },
      });
    },
  });

  const ValidateTokenMutation = nexus.extendType({
    type: 'Mutation',
    definition(t) {
      t.field('validateTokenForCategory', {
        type: 'ValidationToken',
        args: { token: 'String', categorySlug: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 0, scope: 'PRIVATE' });
          const category = await findOneBySlug(strapi, args.categorySlug, {});
          if (!category) {
            return new UserInputError('unable to find gallery');
          }
          if (args.token === category.token) {
            const token = jwt.sign(
              {
                categorySlug: args.categorySlug,
              },
              args.token,
              { expiresIn: '4h' }
            );
            if (context && context.koaContext && context.koaContext.cookies) {
              context.koaContext.cookies.set('category_token', token);
            }
            return {
              valid: true,
              token,
            };
          }

          return {
            valid: false,
          };
        },
      });
    },
  });

  /**
   * Field-level overrides for the Category type.
   */
  const resolvers = {
    Category: {
      async file(obj, args, context, info) {
        if (!obj.file) {
          return null;
        }
        if (!obj.public) {
          const token = getHeader(context, 'x-gallery-token');
          setCacheHint(info, { maxAge: 60, scope: 'PRIVATE' });
          if (!token) {
            return new AuthenticationError('auth required for file');
          }
          try {
            jwt.verify(token, obj.token);
          } catch (e) {
            console.error('error ', e);
            return new ForbiddenError('invalid token parse');
          }
        } else {
          setCacheHint(info, { maxAge: 60, scope: 'PUBLIC' });
        }
        obj.file.url = getOriginalUrl(obj.file);
        return obj.file;
      },
      async medias(obj, args, context, info) {
        setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
        const medias = [...(obj.medias || [])];
        const start = args.start || 0;
        const limit = args.limit;
        const sort = args.sort || 'id:desc';
        if (sort && sort !== 'id:desc') {
          const [field, direction = 'desc'] = sort.split(':');
          const dir = direction === 'asc' ? 1 : -1;
          medias.sort((a, b) => {
            const left = a?.[field] ?? 0;
            const right = b?.[field] ?? 0;
            if (left === right) return 0;
            return (left < right ? -1 : 1) * dir;
          });
        }
        if (limit == null) {
          return medias;
        }
        return medias.slice(start, start + limit);
      },
    },
  };

  return {
    types: [ValidationToken, CategoryExtensions, CategoryQueries, ValidateTokenMutation],
    resolvers,
  };
};
