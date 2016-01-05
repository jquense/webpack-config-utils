import path from 'path';
import webpack from 'webpack';

export default function({ path, image: imageOptions }) {

  if (arguments[0]._config)
    return assetConfig(...arguments)

  return assetConfig

  function assetConfig(config) {
    let name = 'asset-[name].[ext]'
      , fonts = 'fonts/' + name
      , images = 'images/' + name;

    if (path) {
      fonts = path.join(path, fonts)
      images = path.join(path, images)
    }

    config
      .loader('web-fonts', loader => loader('url')
        .test(/\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/)
        .options({
          limit: 10000,
          mimetype: 'application/font-woff',
          name: fonts
        })
      )
      .loader('file-fonts', loader => loader('file')
        .test(/\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/)
        .options({ name: fonts })
      )
      .loader('images', loader => loader('file')
        .for('jpe', 'jpeg', 'png', 'gif')
        .options({ name: images })
        .inProduction(loader => loader
          .push(sub => sub('image-webpack')
            .options({
              progressive: true,
              optimizationLevel: 5,
              ...imageOptions
            })
          )
        )
      )
  }
}
