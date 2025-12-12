// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nrwl/webpack');

module.exports = composePlugins(withNx(), (config) => {

  // Disable content hashing for main.js to allow Docker CMD to reference it
  config.output = config.output || {};
  config.output.filename = (chunkData) => {
    // Don't use hash for main chunk (SSR server entry point)
    if (chunkData.chunk.name === 'main') {
      return '[name].js';
    }
    // Keep hashing for other chunks
    return '[name].[contenthash].js';
  };

  // Disable ALL code splitting for SSR - bundle everything together
  // Code splitting should only happen on the client-side (photos app)
  config.optimization = config.optimization || {};
  config.optimization.splitChunks = false;
  config.optimization.runtimeChunk = false;

  // Prevent dynamic imports from creating separate chunks
  config.output.chunkFormat = false;

  // Add babel-loader for TypeScript files to ensure @loadable/babel-plugin is applied
  config.module.rules.unshift({
    test: /\.(ts|tsx)$/,
    include: [
      /apps\/photos-ssr\/src/,
      /apps\/photos\/src/,
    ],
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        configFile: require.resolve('../../babel.config.json'),
        babelrc: true,
      }
    }
  });

  // SSR doesn't need to process CSS - client build handles it
  // Use null-loader to ignore CSS imports on server
  config.module.rules.push({
    test: /\.css$/,
    use: 'null-loader'
  });
  return config;
});
