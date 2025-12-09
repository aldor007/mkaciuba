import nrwlConfig from "@nrwl/react/plugins/webpack";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default (config) => {
  config.module.rules.push(
      {
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                tailwindcss,
                autoprefixer,
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
