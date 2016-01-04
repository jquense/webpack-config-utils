import webpack from 'webpack';

export default function assetConfig(config) {
  config
    .loader({ test: /\.gif$/,
        loader: 'url-loader?mimetype=image/png&' + name.replace('fonts', 'img')
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff&' + name
      },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?' + name
      })
}
