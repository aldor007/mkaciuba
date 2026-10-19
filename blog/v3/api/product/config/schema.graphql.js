/**
 * GraphQL customizations for the Product API.
 *
 * Strapi v3 shadow CRUD generates `products`, `product` and `productsConnection`
 * but NOT a Count query — `productsCount` is defined here following the
 * postsCount/categoriesCount pattern used by the other APIs.
 */
module.exports = {
  definition: `
    extend type Query {
      productsCount(where: JSON): Int!
    }
  `,
  resolver: {
    Query: {
      productsCount: {
        resolverOf: 'application::product.product.find',
        resolver: async (obj, options, context, info) => {
          const where = (options && options.where) || {};
          return await strapi.services.product.count(where);
        },
      },
    },
  },
};
