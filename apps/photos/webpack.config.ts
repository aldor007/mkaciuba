import nrwlConfig from "@nrwl/react/plugins/webpack"; // require the main @nrwl/react/plugins/webpack configuration function.
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import S3Plugin from 'webpack-s3-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import gitsha from 'gitsha';


export default (config) => {
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
          plugins: async () => {
            const postcssImport = (await import('postcss-import')).default;
            const tailwindcss = (await import('tailwindcss')).default;
            const autoprefixer = (await import('autoprefixer')).default;
            return [
              postcssImport,
              tailwindcss('./tailwind.config.js'),
              autoprefixer,
            ];
          },
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
  if (process.env.NODE_ENV === 'production') {
    config.optimization = {
      splitChunks: {
        chunks: 'all',
      },
        minimize: true,
        minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        // `...`,
        new CssMinimizerPlugin(),
        new TerserPlugin(),
        ],
    };
  }
  return nrwlConfig(config);
};