'use strict';

const cache = require('../utils/cache');
const { translateWhere, setCacheHint } = require('./utils');

/**
 * Remaining v3 custom queries (flat v3 shape) and id extensions:
 * pageBySlug, page(id), postCategories, postCategoryBySlug, tagBySlug,
 * tags, tag(id), products, productsCount, footer, menu.
 */
module.exports = ({ nexus }) => {
  const IdExtensions = [
    'PostCategory',
    'Tag',
    'Page',
    'Product',
    'Menu',
    'Footer',
  ].map((typeName) =>
    nexus.extendType({
      type: typeName,
      definition(t) {
        t.nonNull.id('id');
      },
    })
  );

  const MiscQueries = nexus.extendType({
    type: 'Query',
    definition(t) {
      t.list.field('products', {
        type: 'Product',
        args: { where: 'JSON', limit: 'Int', start: 'Int', sort: 'String' },
        async resolve(obj, args, context, info) {
          return strapi.entityService.findMany('api::product.product', {
            filters: translateWhere(args.where),
            sort: args.sort || 'id:desc',
            start: args.start || 0,
            limit: args.limit,
            populate: { images: true },
          });
        },
      });

      t.list.field('tags', {
        type: 'Tag',
        args: { where: 'JSON', limit: 'Int', start: 'Int', sort: 'String' },
        async resolve(obj, args, context, info) {
          return strapi.entityService.findMany('api::tag.tag', {
            filters: translateWhere(args.where),
            sort: args.sort || 'id:desc',
            start: args.start || 0,
            limit: args.limit,
            populate: {
              posts: {
                populate: {
                  image: true,
                  cover_image: true,
                  tags: true,
                  category: true,
                  gallery: true,
                },
              },
            },
          });
        },
      });

      t.field('tag', {
        type: 'Tag',
        args: { id: nexus.nonNull('ID') },
        async resolve(obj, args, context, info) {
          return strapi.entityService.findOne('api::tag.tag', args.id, {
            populate: {
              posts: {
                populate: {
                  image: true,
                  cover_image: true,
                  tags: true,
                  category: true,
                  gallery: true,
                },
              },
            },
          });
        },
      });

      t.field('page', {
        type: 'Page',
        args: { id: nexus.nonNull('ID') },
        async resolve(obj, args, context, info) {
          return strapi.entityService.findOne('api::page.page', args.id, {});
        },
      });

      t.field('pageBySlug', {
        type: 'Page',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 86600, scope: 'PUBLIC' });
          const found = await strapi.entityService.findMany('api::page.page', {
            filters: { slug: args.slug },
            limit: 1,
          });
          return found && found[0];
        },
      });

      t.field('postCategoryBySlug', {
        type: 'PostCategory',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const found = await strapi.entityService.findMany('api::post-category.post-category', {
            filters: { slug: args.slug },
            limit: 1,
          });
          return found && found[0];
        },
      });

      t.field('tagBySlug', {
        type: 'Tag',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const found = await strapi.entityService.findMany('api::tag.tag', {
            filters: { slug: args.slug },
            limit: 1,
            populate: {
              posts: {
                populate: {
                  image: true,
                  cover_image: true,
                  tags: true,
                  category: true,
                  gallery: true,
                },
              },
            },
          });
          return found && found[0];
        },
      });

      t.nonNull.int('productsCount', {
        args: { where: 'JSON' },
        async resolve(obj, args, context, info) {
          const where = translateWhere(args.where) || {};
          return strapi.db.query('api::product.product').count({ where });
        },
      });

      t.field('footer', {
        type: 'Footer',
        async resolve(obj, args, context, info) {
          const key = 'footer';
          let footer = await cache.get(key);
          if (footer) {
            return footer;
          }
          const found = await strapi.entityService.findMany('api::footer.footer', {
            populate: {
              FeaturedCategories: {
                populate: { image: true },
              },
            },
          });
          footer = found && found[0];
          await cache.set(key, footer, 600);
          return footer;
        },
      });

      t.field('menu', {
        type: 'Menu',
        async resolve(obj, args, context, info) {
          const key = 'menu';
          let menu = await cache.get(key);
          if (menu) {
            return menu;
          }
          const found = await strapi.entityService.findMany('api::menu.menu', {
            populate: {
              topMenu: { populate: { image: true } },
              mainMenu: { populate: { image: true } },
              socialIcons: { populate: { image: true } },
              brand: true,
            },
          });
          menu = found && found[0];
          await cache.set(key, menu, 600);
          return menu;
        },
      });
    },
  });

  const PostCategoriesQuery = nexus.extendType({
    type: 'Query',
    definition(t) {
      t.list.field('postCategories', {
        type: 'PostCategory',
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          return strapi.entityService.findMany('api::post-category.post-category', {});
        },
      });
    },
  });

  return {
    types: [...IdExtensions, MiscQueries, PostCategoriesQuery],
  };
};
