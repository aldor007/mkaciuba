const { getStoragePath, base64Url } = require('../../../lib/index');
module.exports = {
    definition: `
    extend type Query {
      postCategoryBySlug(slug: String): PostCategory
  }
  `,
  resolver: {
    Query: {
      postCategory: false,
      postCategories: {
        resolverOf: 'application::post-category.post-category.find',
        resolver: async (obj, options, { context }, info) => {
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          return await strapi.services['post-category'].find();
        }
      },
      postCategoryBySlug: {
        resolverOf: 'application::post-category.post-category.find',
        resolver: async (obj, options, { context }, info) => {
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          return await strapi.services['post-category'].findOne({slug: options.slug});
        }
      },
    },
  }
};
