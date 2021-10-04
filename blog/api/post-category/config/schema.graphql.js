const { getStoragePath, base64Url } = require('../../../lib/index');

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
      postCategoryBySlug(slug: String): PostCategory
  }
  `,
  resolver: {
    Query: {
      postCategory: false,
      postCategories: false,
      postCategoryBySlug: {
        resolverOf: 'application::post-category.post-category.find',
        resolver: async (obj, options, { context }, info) => {
          info.cacheControl.setCacheHint({ maxAge: 600, scope: 'PUBLIC' });
          const key = getCacheKey('post-category', options);
          let cat = await strapi.services.cache.get(key)
          if (cat) {
            return cat;
          }
          cat = await strapi.services['post-category'].findOne({slug: options.slug});
          return cat;
        }
      },
    },
  }
};
