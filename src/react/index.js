import babel from '../es6'

export default function reactConfig(config) {
  config
    .use(babel)
    .extension('jsx')
    .inDevelopment(config => config
      .hot()
      .plugin('no-errors', new webpack.NoErrorsPlugin())
      .adjustLoader('babel', loader => loader
        .unshift('react-hot')
        .for('.jsx')
      )
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
}
