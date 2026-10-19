'use strict';

module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-mort',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
  graphql: {
    config: {
      amountLimit: 30,
      defaultLimit: 30,
      depthLimit: 7,
    },
  },
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
});
