import HtmlWebpackPlugin from 'html-webpack-plugin';
import configure from '../../../src'
import react from '../../../src/react'

export default configure()
  .use(react)
  .entry(__dirname + '/entry.js')
  .output(__dirname + '/../output/bundle.js')
  .plugin('html', new HtmlWebpackPlugin())
  .resolve()
