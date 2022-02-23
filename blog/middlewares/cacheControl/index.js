
module.exports = strapi => {
    return {
      initialize: function(cb) {
        strapi.app.use(async (ctx, next) => {
            throw "dupa"
          await next();

          // Set X-Response-Time header
          ctx.set('x-powered-by', 'RPI + old laptop');
          if (!ctx.response.has('cache-control')) {
              ctx.set('cache-control','no-cache')
          }
        });

        cb();
      },
    };
  };