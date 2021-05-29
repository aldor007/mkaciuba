module.exports = ({ env }) => ({
    settings: {
      cache: {
        enabled: true,
        models: ['category', 'gallery', 'menu', 'uploadfile'],
        maxAge: 600 * 1000
      }
    }
  });