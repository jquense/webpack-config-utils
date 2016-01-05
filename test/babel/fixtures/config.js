import HtmlWebpackPlugin from 'html-webpack-plugin';
import configure from '../../../src'
import babel from '../../../src/babel'

export default configure()
  .use(babel)
  .entry(__dirname + '/entry.js')
  .output(__dirname + '/../output/bundle.js')
  .plugin('html', new HtmlWebpackPlugin())
  .resolve()
