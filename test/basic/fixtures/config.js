import HtmlWebpackPlugin from 'html-webpack-plugin';
import configure from '../../../src'
import basic from '../../../src/basic'

export default configure()
  .use(basic)
  .entry(__dirname + '/entry.js')
  .output(__dirname + '/../output/bundle.js')
  .plugin('html', new HtmlWebpackPlugin())
  .resolve()
