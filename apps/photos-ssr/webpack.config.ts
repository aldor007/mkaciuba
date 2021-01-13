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
              ident: 'postcss',
              plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
              ],
            },
          },
        ],
      }
  );
  return config;
};
