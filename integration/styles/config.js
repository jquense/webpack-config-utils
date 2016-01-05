var configure = require('webpack-config-utils')
var styles = require('../')

module.exports = configure()
  .use(styles)
  .entry(__dirname + '/index.js')
  .output(__dirname + '/bundle.js')
  .resolve()
