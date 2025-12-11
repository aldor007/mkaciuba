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

  config.module.rules.push(
    {
      test: /\.css$/,
      use: [
        {
          // Interprets `@import` and `url()` like `import/require()` and will resolve them
          loader: 'css-loader',
          options: {
            modules: {
              exportOnlyLocals: true
            }
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                ['tailwindcss', {
                  purge: [
                    './src/**/*.html',
                    './src/**/*.jsx',
                  ],
                  theme: {},
                  variants: {},
                  plugins: [],
                }],
                require('autoprefixer'),
              ],
            },
          },
        },
      ],
    }
  );
  return config;
});
