const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const S3Plugin = require('webpack-s3-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const gitsha = require('gitsha')

// Plugin to fix null layer values in CSS modules for mini-css-extract-plugin compatibility
class FixCssLayerPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('FixCssLayerPlugin', (compilation) => {
      compilation.hooks.afterOptimizeModules.tap('FixCssLayerPlugin', (modules) => {
        for (const module of modules) {
          if (module.layer === null) {
            module.layer = undefined;
          }
        }
      });
    });
  }
}


module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Fix import.meta issue for non-module builds
  if (!config.output) config.output = {};
  config.output.environment = {
    ...config.output.environment,
    dynamicImport: false,
    module: false,
  };
  config.output.scriptType = 'text/javascript';

  // Add plugin to fix null layer values
  config.plugins.push(new FixCssLayerPlugin());

  // Remove existing MiniCssExtractPlugin to avoid duplicates
  config.plugins = config.plugins.filter(
    plugin => !(plugin instanceof MiniCssExtractPlugin)
  );

  config.plugins.push( new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
  }));
  config.plugins.push(new WebpackManifestPlugin({
    generate: (seed, files, entries) => {
      const manifest = {};
      files.forEach(file => {
        // Map original filename to hashed filename for CDN assets
        // Strip 'auto' prefix that webpack adds to file.path
        manifest[file.name] = file.path.replace(/^auto/, '');
      });
      return manifest;
    }
  }));
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

  // Remove default Nx CSS handling to use our own
  const cssRuleIndex = config.module.rules.findIndex(rule =>
    rule && rule.test && rule.test.toString().includes('\\.css')
  );
  if (cssRuleIndex !== -1) {
    config.module.rules.splice(cssRuleIndex, 1);
  }

  // Configure CSS processing with Tailwind
  config.module.rules.push({
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              'tailwindcss',
              'autoprefixer',
            ],
          },
        }
      }
    ],
  });

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
  return config;
});
