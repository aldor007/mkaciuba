const nrwlConfig = require("@nrwl/react/plugins/webpack"); // require the main @nrwl/react/plugins/webpack configuration function.
module.exports = config => {
  config.module.rules.push(
      {
        test: /\.css$/,
        use: [
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
  config = nrwlConfig(config);
  config.output = {
    library: 'photos',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    filename: 'photos.js',

  }
  // config.externals =  {
  //   'react': 'React',
  // };

  return config;
};
