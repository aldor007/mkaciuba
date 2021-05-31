const nrwlConfig = require("@nrwl/react/plugins/webpack"); // require the main @nrwl/react/plugins/webpack configuration function.
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = config => {
  config.plugins.push( new MiniCssExtractPlugin({
      filename: '[name].css',
    }));
    const postCssLoader = {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                   require('postcss-import'),

                  require('tailwindcss')('./tailwind.config.js'),

                  require('autoprefixer'),
                ],
              },
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
    // css.push('style-loader', ssrConfig);
  // } else {
  // }

    css.push(MiniCssExtractPlugin.loader)
    css.push(ssrConfig);
  css.push(postCssLoader);

  config.module.rules.push(
      {
        test: /\.css$/,
        use: css,
      }
  );
//   config.plugins.push(    new BundleAnalyzerPlugin())
  if (process.env.NODE_ENV == 'production') {
    config.optimization = {
      splitChunks: {
        chunks: 'all',
      },
        minimize: true,
        minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        // `...`,
        // new CssMinimizerPlugin(),
        new TerserPlugin(),
        ],
    };
  }
  return nrwlConfig(config);
};