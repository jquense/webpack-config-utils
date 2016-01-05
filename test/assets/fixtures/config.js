import HtmlWebpackPlugin from 'html-webpack-plugin';
import configure from '../../../src'
import assets from '../../../src/assets'

export default configure()
  .use(assets)
  .entry(__dirname + '/entry.js')
  .output(__dirname + '/../output/bundle.js')
  .plugin('html', new HtmlWebpackPlugin())
  .resolve()
