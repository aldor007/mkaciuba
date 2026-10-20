const { getStoragePath, base64Url } = require('../../../lib/index');
module.exports = {
    definition: `
    extend type Query {
      pageBySlug(slug: String): Page
  }
  `,
  resolver: {
    Query: {
      pages: false,
      pageBySlug: {
        resolverOf: 'application::post-category.post-category.find',
        resolver: async (obj, options, { context }, info) => {
          info.cacheControl.setCacheHint({ maxAge: 86600, scope: 'PUBLIC' });
          return await strapi.services.page.findOne({slug: options.slug});
        }
      },
    },
  }
};
