import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function styleConfig(config) {
  return config
    .loader('styles', function(loader) {
      return loader('style', 'css').ext('css')
    })
}

styleConfig.extract = function(config) {
  var extract = new ExtractTextPlugin('[name]-styles.css', { allChunks: true })
    , extractLoader = ExtractTextPlugin.extract('style-loader', 'css-loader');

  return styleConfig(config)
    .plugin('extract-styles', extract)
    .replaceLoader('styles', loader => loader(extractLoader).ext('css'))
}
