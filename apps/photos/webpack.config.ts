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
    console.log('🔵 S3 Plugin: AWS credentials detected, enabling S3 upload');
    console.log('🔵 S3 Config:', {
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION,
      basePath: process.env.AWS_BASE_PATH,
      endpoint: process.env.AWS_ENDPOINT || 'default',
    });
    console.log('🔵 S3 Config validation:', {
      bucketDefined: !!process.env.AWS_BUCKET,
      bucketValue: process.env.AWS_BUCKET ? `${process.env.AWS_BUCKET.substring(0, 3)}...` : 'UNDEFINED',
      regionDefined: !!process.env.AWS_REGION,
      accessKeyDefined: !!process.env.AWS_ACCESS_KEY_ID,
      secretKeyDefined: !!process.env.AWS_SECRET_ACCESS_KEY,
    });

    const s3Plugin = new S3Plugin({
       exclude: /.*\.html$/,
      directory: config.output?.path,  // Explicitly set output directory
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
      basePath: process.env.AWS_BASE_PATH,
      progress: true  // Boolean to enable built-in progress bar
    });

    console.log('🔵 S3 Plugin will upload from directory:', config.output?.path);

    console.log('🔵 S3 Plugin options configured:', {
      hasExclude: true,
      hasS3Options: true,
      hasUploadOptions: true,
      uploadBucket: s3Plugin.uploadOptions?.Bucket ? 'SET' : 'NOT SET',
      basePath: s3Plugin.options?.basePath || 'NOT SET',
    });

    config.plugins.push(s3Plugin);

    // Add webpack hook to track S3 plugin execution
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('S3UploadLogger', (compilation) => {
          console.log('🔵 Webpack afterEmit hook: Build complete, S3 plugin should now upload files');
          const assets = Object.keys(compilation.assets);
          console.log(`🔵 Total assets emitted: ${assets.length}`);
          console.log(`🔵 CSS assets: ${assets.filter(a => a.endsWith('.css')).join(', ')}`);
        });

        compiler.hooks.done.tap('S3UploadLogger', (stats) => {
          console.log('🔵 Webpack done hook: Compilation finished');
          if (stats.hasErrors()) {
            console.log('❌ Compilation had errors');
          } else {
            console.log('✅ Compilation successful, waiting for S3 upload...');
          }
        });

        // Catch S3 plugin errors
        compiler.hooks.failed.tap('S3UploadErrorLogger', (error) => {
          console.log('❌ Webpack failed hook triggered:', error);
        });

        // Wait a bit to see S3 output
        compiler.hooks.done.tapAsync('WaitForS3', (stats, callback) => {
          console.log('🔵 Waiting 3 seconds for S3 upload to complete...');
          setTimeout(() => {
            console.log('🔵 Post-compilation wait complete. Check above for S3 upload output or errors.');
            callback();
          }, 3000);
        });
      }
    });

    console.log('🔵 S3 Plugin registered. Files will be uploaded after webpack compilation.');
  } else {
    console.log('⚠️  S3 Plugin: AWS_ACCESS_KEY_ID not found, S3 upload disabled');
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
