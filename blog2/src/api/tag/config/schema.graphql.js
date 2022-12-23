const { getStoragePath, base64Url } = require('../../../lib/index');

module.exports = {
    definition: `
    extend type Query {
      tagBySlug(slug: String): Tag
  }
  `,
  resolver: {
    Query: {
      tagBySlug: {
        resolverOf: 'application::tag.tag.find',
        resolver: async (obj, options, { context }, info) => {
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          return await strapi.services.tag.findOne({slug: options.slug});
        }
      },
    },
  }
};
