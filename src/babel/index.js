
export default function babel(config) {
  let exts = ['js', 'babel', 'babel.js', 'es6']
  config
    .extensions(...exts)
    .replaceLoader('babel', loader => loader()
      .ext(...exts)
    )
}
