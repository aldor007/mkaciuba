
module.exports = {
  resolver: {
    Query: {
      menu: {
        resolverOf: 'application::menu.menu.find',
        resolver: async (obj, options, { context }) => {
          const key = 'menu';
          let menu = await strapi.services.cache.get(key)
          if (menu) {
            return menu 
          }
          menu = await strapi.services.menu.find()
          strapi.services.cache.set(key, menu, 600);
          return menu;
        }
      }
    }
  }
};
