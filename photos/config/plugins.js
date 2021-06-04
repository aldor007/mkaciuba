module.exports = ({ env }) => ({
  // ...
  upload: {
    provider: 'mort',
    providerOptions: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_ACCESS_SECRET'),
      region: env('AWS_REGION'),
      params: {
        Bucket: env('AWS_BUCKET'),
      },
    },
  },
  graphql: {
    amountLimit: 16,
    apolloServer: {
      tracing: false 
    }
  },
  // ...
});
