const nrwlConfig = require("@nrwl/react/plugins/webpack"); // require the main @nrwl/react/plugins/webpack configuration function.
module.exports = config => {
    const postCssLoader = {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
              ],
            },
          };
  const ssrConfig =       {
            loader: 'css-loader',
            options: {
                importLoaders: 1

            }
          };

  const css = [];
  // if (process.env.SSR) {
    css.push(ssrConfig);
  // } else {
  //   // css.push('css-loader', 'style-loader');
  // }

  css.push(postCssLoader);

  config.module.rules.push(
      {
        test: /\.css$/,
        use: css,
      }
  );
  return nrwlConfig(config);
};
