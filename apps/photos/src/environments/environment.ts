// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

export const environment = {
  production: false,
  // Use absolute URL to support both SSR (Node.js fetch) and client (browser)
  // SSR server proxies /graphql to Strapi, so this works in all environments
  apiUrl: typeof window !== 'undefined' ? '/graphql' : 'https://mkaciuba.pl/graphql',
};
