import webpack from 'webpack';

export default function(config) {
  return config
    .extension('json')
    .modules('bower_components')
    .sourcemap('cheap-module-eval-source-map')
    .replaceLoader('json')
    .replaceLoader('raw')
    .replacePlugin('occurence', new webpack.optimize.OccurenceOrderPlugin())
    .replacePlugin('common', new webpack.optimize.CommonsChunkPlugin('common.bundle.js'))
    .inTest(config => config
      .sourcemap('inline-source-map')
    )
    .inProduction(config => config
      .sourcemap('source-map')
      .replacePlugin('dedupe', new webpack.optimize.DedupePlugin())
      .plugin('uglify', new webpack.optimize.UglifyJsPlugin({
        output : { comments: false },
        compress : {
          unused: true,
          dead_code: true,
          warnings: false,
        }
      }))
    )
}
