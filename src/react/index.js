import webpack from 'webpack';
import babel from '../babel';

export default function reactConfig(config) {
  config
    .use(babel)
    .extension('jsx')
    .adjustLoader('babel', loader => loader
      .for('jsx')
    )
    .inProduction( config => config
      .define('process.env.NODE_ENV', 'production')
      .raw({
        babel: {
          stage: 1,
          plugins: [
            require('babel-plugin-dev-expression')
          ]
        }
      })
    )
    .on('hot', isHot => {
      if (isHot) config
        .plugin('no-errors', new webpack.NoErrorsPlugin())
        .adjustLoader('babel', loader => loader
          .unshift('react-hot'))
      else config
        .removePlugin('no-errors', new webpack.NoErrorsPlugin())
        .adjustLoader('babel', loader => loader
          .remove('react-hot'))
    })
}
