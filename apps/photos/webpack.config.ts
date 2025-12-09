const nrwlConfig = require("@nrwl/react/plugins/webpack"); // require the main @nrwl/react/plugins/webpack configuration function.
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const S3Plugin = require('webpack-s3-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const gitsha = require('gitsha')


module.exports = config => {
  config.plugins.push( new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
  }));
  config.plugins.push(new WebpackManifestPlugin());
  if (process.env.AWS_ACCESS_KEY_ID) {

    config.plugins.push(new S3Plugin({
       exclude: /.*\.html$/,
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        computeChecksums: true,
        // s3ForcePathStyle: true,
        // sslEnabled: false,
        endpoint: process.env.AWS_ENDPOINT,
      },
      s3UploadOptions: {
        Bucket: process.env.AWS_BUCKET,
        ACL: 'private'
      },
      basePath: process.env.AWS_BASE_PATH
    }));
  }
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
  const ssrConfig = {
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