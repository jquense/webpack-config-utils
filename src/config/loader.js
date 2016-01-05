import trimLeft from 'lodash/string/trimLeft'
import findIndex from 'lodash/array/findIndex'
import assert from 'assert';
import escape from 'escape-regexp';
import * as utils from './utils';
import injectEnv from './inject/env';

let getLoader = loader => loader.loader || loader;

let canChain = l => typeof l === 'string' || (l && !l._query)
let toSingle = l => ({
  _query: l._query,
  _loaders: [ l.loader || l ]
})


export default function buildLoader(...loaders) {
  let builder = Object.assign(Object.create(loaderBuilder), {
    _loaders: [],
    _tests: [],
    _exts: [],
    _envs: [],
    _includes: [],
    _excludes: [/node_modules/]
  })

  if (loaders.length)
    builder.set(...loaders)

  return builder;
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
    query: loaderBuilder.query,
    options: loaderBuilder.query,
  }), { loader, _query })
}


let loaderBuilder = {
  set(...loaders) {
    this._loaders = buildLoaders(loaders)
    return this
  },

  remove(...loaders) {
    this._loaders = this._loaders
      .filter(l => loaders.indexOf(l.loader || l) === -1)
    return this
  },

  unshift(...loaders) {
    if (this._loaders.length === 1) {
      let name = getLoader(this._loaders[0])
      this._loaders[0] = lilBuilder(name).query(this._query)
    }
    this._loaders = buildLoaders(loaders).concat(this._loaders)
    return this
  },

  push(...loaders) {
    if (this._loaders.length === 1) {
      this._loaders[0] = lilBuilder(this._loaders[0]).query(this._query)
    }

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

  test(...tests) {
    this._tests = this._tests.concat(tests);
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

  removeExt(...exts) {
    exts = exts.map(ext => trimLeft(ext, '.'))
    this._exts = this._exts.filter(ext => exts.indexOf(ext) === -1)
    return this
  },

  toInline(stringify = true) {
    let loaders = this._loaders;
    return loaders.map(loader => {
      let name = loader.loader || loader
        , query = loader.query;

      if (query)
        query = '?' + (stringify && typeof query !== 'string')
          ? JSON.stringify(query) : utils.stringifyQuery(query)

      return name + (query || '')
    })
    .join('!')
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

    loaders = loaders.map(getLoader)

    if (loaders.length === 1)
      result.loader = loaders[0]
    else
      result.loaders = loaders

    assert.ok(this._exts.length || this._tests.length,
      'All loaders must match some file type with ext(), or contain a test()');

    result.test = this._tests.concat()

    if (this._exts.length)
      result.test.push(
        new RegExp('\\.(' + this._exts.map(escape).join('|') + ')$', 'i')
      )

    if (this._includes.length)
      result.include = this._includes

    if (this._excludes.length)
      result.exclude = this._excludes

    if (this._query)
      result.query = this._query

    result.test = unwrap(result.test)

    return result
  }
}

loaderBuilder.options = loaderBuilder.query;
loaderBuilder.for = loaderBuilder.ext;
loaderBuilder.notFor = loaderBuilder.removeExt;
loaderBuilder.use = loaderBuilder.set;

injectEnv(loaderBuilder)


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

function buildLoaders(loaders) {
  loaders = loaders.reduce((arr, l) =>
      arr.concat(typeof l === 'string' ? l.split('!'): l)
    , [])

  return loaders.map(loader => {
    if (typeof loader === 'function')
      return loader(lilBuilder)

    loader = lilBuilder(loader)

    if (canChain(loader))
      loader = loader.loader

    return loader
  })
}

function unwrap(arr) {
  return arr.length === 1 ? arr[0] : arr
}
