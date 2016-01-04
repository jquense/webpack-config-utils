import webpack from 'webpack';

export default function(config) {
  return config
    .loader('json')
    .loader('raw')
    .extension('json')
    .module('bower_components')
    .sourcemap('cheap-module-eval-source-map')
    .plugin('dedupe', new webpack.optimize.DedupePlugin())
    .plugin('occurence', new webpack.optimize.OccurenceOrderPlugin())
    .plugin('common', new webpack.optimize.CommonsChunkPlugin('common.bundle.js'))
    .inTest(config =>
      config.sourcemap('inline-source-map'))
    )
    .inProduction(config =>
      config
        .sourcemap('source-map')
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
