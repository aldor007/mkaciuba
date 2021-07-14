
module.exports = {
  resolver: {
    Query: {
      footer: {
        resolverOf: 'application::footer.footer.find',
        resolver: async (obj, options, { context }) => {
          const key = 'footer';
          let footer = await strapi.services.cache.get(key)
          if (footer) {
            return footer 
          }
          footer = await strapi.services.footer.find()
          strapi.services.cache.set(key, footer, 600);
          return footer;
        }
      }
    }
  }
};
