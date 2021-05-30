

module.exports = (config, context) => {
   const {
    options: { outputPath, filename },
  } = context;

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
};
