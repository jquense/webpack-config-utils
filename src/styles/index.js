import ExtractTextPlugin from 'extract-text-webpack-plugin';
import assets from '../assets';

function basic(config) {
  config
    .use(assets)
    .loader('styles', loader => loader('style', 'css')
      .ext('css')
    )
}

let presets = basic

presets.basic = basic

presets.less = function(config) {
  config
    .use(basic)
    .adjustLoader('styles', loader => loader
      .push('less')
      .ext('less')
    )
}

presets.sass = function(config) {
  config
    .use(basic)
    .adjustLoader('styles', loader => loader
      .push('sass')
      .ext('sass', 'scss')
    )
}


Object.keys(presets)
  .forEach(key => createExtractVariant(presets[key]))

module.exports = presets

function createExtractVariant(preset) {
  preset.extract = function(config) {
    var extract = new ExtractTextPlugin('[name]-styles.css', { allChunks: true });

    config
      .use(preset)
      .plugin('extract-styles', extract)
      .adjustLoader('styles', loader => {
        let parts = loader.toInline().split('!')
        return loader.set(ExtractTextPlugin.extract(parts.shift(), parts))
      })
  }
}
