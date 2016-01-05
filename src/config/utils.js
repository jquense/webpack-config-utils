import assert from 'assert';
import ip from 'ip';
import path from 'path';
import jsonic from 'jsonic';
import has from 'lodash/object/has';
import set from 'lodash/object/set';
import get from 'lodash/object/get';
import assign from 'lodash/object/assign';
import defaultsDeep from 'lodash/object/defaultsDeep';

const webpackDevServerAddress = `http://${ip.address()}:${process.env.PORT || 8080}`

const HOT_ENTRY = 'webpack/hot/dev-server';
const DEV_ENTRY = 'webpack-dev-server/client?' + webpackDevServerAddress;


export function ensureConfig(config) {
  if (!config)
    throw new Error("You didn't provide a config object to the config preset")

  return defaultsDeep(config, {
    resolve: {
      extensions: ['', '.js'],
      alias: {},
      root: []
    },
    module: {
      loaders: [],
      postLoaders: [],
      preLoaders: []
    },

    plugins: []
  })
}

export function addEntry(config, entry) {
  if (has(config, 'entry')) {
    if (!config.entry || config.entry === 'string')
      config.entry = config.entry != null ? { '': config.entry } : {}
  }
  else
    config.entry = {}

  if (typeof entry === 'string') {
    let name = path.basename(entry, path.extname(entry))
    if (name.indexOf('index') !== -1)
      name = path.basename(path.dirname(path.resolve(entry)))

    entry = { [name]: entry }
  }

  assign(config.entry, entry)
  return config
}

export function resolveLoader(name) {
  let loader = name
    , parts = name.split('!')

  if (parts.length > 1)
    return parts.map(resolveLoader).join('!')

  if (loader.indexOf('loader') === -1)
    loader += '-loader'

  try {
    loader = require.resolve(loader)
  } catch (err) {
    loader = require.resolve(name)
  }

  return loader
}

export function addLoader(loaders, newLoaders = [], replaces) {
  replaces = [].concat(replaces);

  let idx = loaders.indexOf(replaces[0])

  newLoaders = [].concat(newLoaders)

  newLoaders.forEach(loader => {
    assert.ok(has(loader, 'loader') || has(loader, 'loaders')
      , 'Loaders must contain a `loader` or `loaders` property.')

    assert.ok(loader.test instanceof RegExp
      , 'Loaders must contain a `test` regex property.')

    if (loader.loader)
      loader.loader = resolveLoader(loader.loader)
    else
      loader.loaders = loader.loaders.map(resolveLoader)
  })

  if (idx !== -1)
    loaders.splice(idx, replaces.length)
  else
    idx = loaders.length

  loaders.splice(idx, 0, ...newLoaders)

  return newLoaders.length <= 1 ? newLoaders[0] : newLoaders
}

export function removeLoader(loaders, remove = []) {
  let idx = loaders.indexOf(replaces[0]);

  [].concat(remove)
    .forEach(loader => {
      let idx = loaders.indexOf(loader)

      if (idx !== -1)
        loaders.splice(idx, 1)
    })
}


export function addPlugin(plugins, newPlugins, replaces) {
  replaces = [].concat(replaces);

  let idx = plugins.indexOf(replaces[0])

  newPlugins = [].concat(newPlugins);

  if (idx !== -1)
    plugins.splice(idx, replaces.length)
  else
    idx = plugins.length

  plugins.splice(idx, 0, ...newPlugins)

  return newPlugins.length <= 1 ? newPlugins[0] : newPlugins
}

export function tryParseQuery(query) {
  try {
    query = jsonic(query)
  } catch (_) {}

  return query
}

export function stringifyQuery(query) {
  if (typeof query === 'string') return query

  return Object.keys(query).reduce((str, key) => {
    return str + (str ? '&' : '') + key + '=' + query[key]
  }, '')
}

export function addHotEntries(entry) {
  Object.keys(entry).forEach(name => {
    let current = [].concat(entry[name]);
    if (current.indexOf(HOT_ENTRY) === -1 && current.indexOf(DEV_ENTRY) === -1)
      entry[name] = [
        HOT_ENTRY,
        DEV_ENTRY,
        ...current
      ]
  })
}

let isObject = ob => typeof obj === 'object' && obj !== null && !Array.isArray(object)

export function removeHotEntries(entry) {
  Object.keys(entry).forEach(name => {
    let current = [].concat(entry[name])
      , hotIdx = current.indexOf(HOT_ENTRY);

    if (hotIdx !== -1) current.splice(hotIdx, 1)

    let devIdx = current.indexOf(DEV_ENTRY)
    if (devIdx !== -1) current.splice(devIdx, 1)

    entry[name] = current.length === 1 ? current[0] : current
  })
}
