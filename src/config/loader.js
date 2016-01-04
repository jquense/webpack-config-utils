import trimLeft from 'lodash/string/trimLeft'
import findIndex from 'lodash/array/findIndex'
import assert from 'assert';
import escape from 'escape-regexp';
import * as utils from './utils';

let canChain = l => typeof l === 'string' || (l && !l._query)
let toSingle = l => ({
  _query: l._query,
  _loaders: [ l.loader || l ]
})

function validateStringLoader(str) {
  assert(str.indexOf('!') === -1,
    'Loader modules should be specified individually without the "!"; ' +
    'instead pass each loader name as a seperate argument: \n\n' +
    'change: `("' + str + '")` to: `(' + str.split('!').map(s => '"'+ s + '"').join(', ') + ')` ')

  return str
}

function regexEqual(x, y) {
  if (typeof x === 'string' && typeof y === 'string')
    return x === y

  else if ((x instanceof RegExp) && !(y instanceof RegExp))
    return x.source === y

  else if (!(x instanceof RegExp) && (y instanceof RegExp))
    return x === y.source

  return (x instanceof RegExp) && (y instanceof RegExp) &&
         (x.source === y.source) && (x.global === y.global) &&
         (x.ignoreCase === y.ignoreCase) && (x.multiline === y.multiline);
}


function lilBuilder(loader) {
  let _query;

  validateStringLoader(loader)

  if (loader.indexOf('?') !== -1) {
    let parts = loader.split('?')
    loader = parts.shift()
    _query = parts.join('?')
  }

  return Object.assign(Object.create({
    query: loaderBuilder.query
  }), { loader, _query })
}

function buildLoaders(loaders) {
  return loaders.map(loader => {
    if (typeof loader === 'function')
      return loader(lilBuilder)

    loader = lilBuilder(loader)

    if (canChain(loader))
      loader = loader.loader

    return loader
  })
}

let loaderBuilder = {
  set(...loaders) {
    this._loaders = buildLoaders(loaders)
    return this
  },

  unshift(...loaders) {
    this._loaders = buildLoaders(loaders).concat(this._loaders)
    return this
  },

  push(...loaders) {
    this._loaders = this._loaders.concat(buildLoaders(loaders))
    return this
  },

  when(regex) {
    this._tests.push(regex)
  },

  query(query) {
    this._query = utils.tryParseQuery(query)
    return this
  },

  include(...includes) {
    includes.forEach(include => {
      let idx = findIndex(this._excludes,
        exclude => regexEqual(include, exclude)
      )

      if (idx !== -1)
        this._excludes.splice(idx, 1)
    })

    this._includes = this._includes.concat(includes)

    return this
  },

  exclude(...excludes) {
    excludes.forEach(exclude => {
      let idx = findIndex(this._includes,
        include => regexEqual(include, exclude)
      )

      if (idx !== -1)
        this._includes.splice(idx, 1)
    })

    this._excludes = this._excludes.concat(excludes)

    return this
  },

  ext(...exts) {
    exts = exts.map(ext => {
      assert.ok(typeof ext === 'string', 'extension names must be strings')
      return trimLeft(ext, '.')
    })

    this._exts = this._exts.concat(exts)
    return this
  },

  resolve() {
    let result = {}
    let loaders = this._loaders;

    assert.ok(loaders.length,
      'No loader module provided! Provide a loader with `using()` to point to a local ' +
      'loader module');

    if (loaders.length > 1 && !loaders.every(canChain)) {
      return loaders.map(loader => Object.assign(
        buildLoader(), this, toSingle(loader)).resolve()
      )
    }

    let innerQuery = loaders[0]._query
    if (innerQuery)
      this.query(innerQuery)

    loaders = loaders
      .map(l => typeof l === 'string' ? l : l.loader)

    if (loaders.length === 1)
      result.loader = loaders[0]
    else
      result.loaders = loaders

    assert.ok(this._exts.length || this._tests.length,
      'All loaders must match some file type with ext(), or contain a test()');

    result.test = []

    if (this._exts.length)
      result.test.push(
        new RegExp('\\.(' + this._exts.map(escape).join('|') + ')$', 'i')
      )

    if (this._tests.length)
      result.test.push(...this._tests)

    if (this._includes.length)
      result.include = this._includes

    if (this._excludes.length)
      result.exclude = this._excludes

    if (this._query)
      result.query = this._query

    return result
  }
}

loaderBuilder.for = loaderBuilder.ext;

export default function buildLoader(...loaders) {
  let builder = Object.assign(Object.create(loaderBuilder), {
    _loaders: [],
    _tests: [],
    _exts: [],
    _includes: [],
    _excludes: [/node_modules/]
  })

  if (loaders.length)
    builder.set(...loaders)

  return builder;
}
