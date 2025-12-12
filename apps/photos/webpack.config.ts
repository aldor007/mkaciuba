const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const LoadablePlugin = require('@loadable/webpack-plugin');
// S3 upload now handled by post-build script (tools/upload-to-s3.js)
// const S3Plugin = require('webpack-s3-plugin');
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
    // dynamicImport must be true for code splitting to work
    dynamicImport: true,
    module: false,
  };
  config.output.scriptType = 'text/javascript';

  // Force output hashing for JS files in production to prevent manifest corruption
  // This ensures hashing is applied even when photos is rebuilt as a dependency
  if (process.env.NODE_ENV === 'production') {
    config.output.filename = '[name].[contenthash].js';
    config.output.chunkFilename = '[name].[contenthash].js';
  }

  // Add plugin to fix null layer values
  config.plugins.push(new FixCssLayerPlugin());

  // Remove existing MiniCssExtractPlugin to avoid duplicates
  config.plugins = config.plugins.filter(
    plugin => !(plugin instanceof MiniCssExtractPlugin)
  );

  // Use contenthash for CSS files in production, simple names in development
  // This ensures consistent behavior with JS files (controlled by outputHashing in project.json)
  const cssFilename = process.env.NODE_ENV === 'production' ? '[name].[contenthash].css' : '[name].css';
  config.plugins.push( new MiniCssExtractPlugin({
    filename: cssFilename,
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

  // Add LoadablePlugin to generate loadable-stats.json for SSR
  config.plugins.push(new LoadablePlugin({
    filename: 'loadable-stats.json',
    writeToDisk: true
  }));

  // S3 upload now handled by post-build script: node tools/upload-to-s3.js
  // See .github/workflows for usage

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
