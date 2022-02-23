module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'b32661a75fd9bf43128f3822bdc23bd9'),
  },
});
