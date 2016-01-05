import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createPreset } from './helpers';

export default createPreset(function htmlConfig(config) {
  config.plugin('html', new HtmlWebpackPlugin(this.options))
}
