
export default function es6(config) {
  config
    .extensions('babel', 'babel.js', 'es6')
    .replaceLoader('babel', loader =>
      loader().ext('js', 'babel', 'es6')
    )
}
