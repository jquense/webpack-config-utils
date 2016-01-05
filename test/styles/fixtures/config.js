import HtmlWebpackPlugin from 'html-webpack-plugin';
import configure from '../../../src'
import styles from '../../../src/styles'

export default configure()
  .use(styles)
  .entry(__dirname + '/entry.js')
  .output(__dirname + '/../output/bundle.js')
  .plugin('html', new HtmlWebpackPlugin())
  .resolve()
