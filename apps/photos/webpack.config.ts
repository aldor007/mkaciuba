const nrwlConfig = require("@nrwl/react/plugins/webpack"); // require the main @nrwl/react/plugins/webpack configuration function.
module.exports = config => {
  config.module.rules.push(
      {
        test: /\.css$/,
        use: [
          'isomorphic-style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
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
  return nrwlConfig(config);
};
