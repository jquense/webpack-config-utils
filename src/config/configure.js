import path from 'path';
import assert from 'assert';
import webpack from 'webpack';

import set from 'lodash/object/set';
import merge from 'lodash/object/merge';
import union from 'lodash/array/union';
import transform from 'lodash/object/transform';

import * as inject from './inject';
import * as utils from './utils';
import validate from './validate';

import clone from './clone';

const DEDUPE_ARRAY = [
    'root'
  , 'loaders'
  , 'preLoaders'
  , 'postLoaders'
  , 'extensions'
];

function concat(a, b, key) {
  if (Array.isArray(a)) {
    if (DEDUPE_ARRAY.indexOf(key) !== -1)
      return union(a, b)
    else
      return a.concat(b)
  }
}

export default function create(defaults, options = {}) {
  let initConfig;

  if (defaults && defaults.__isConfig === true) {
    initConfig = defaults.clone()
  } else {
    initConfig = {
      _config: utils.ensureConfig(defaults || {}),
      options,
      _onResolve: [],
      _loaders: {},
      _preLoaders: {},
      _postLoaders: {},
      _plugins: {},
      _defines: {},
      _envs: {},
    }
  }

  let config = Object.assign(Object.create(fluent), initConfig)

  Object.defineProperties(config, {
    valueOf: { value: fluent.resolve },
    __isConfig: { value: true }
  })

  return config
}

let fluent = {
  clone() {
    return clone(this)
  },

  sourcemap(type = 'source-map') {
    this._config.devtool = type;
  },

  entry(name, entry) {
    if (arguments.length === 2)
      entry = { [name]: entry }
    else
      entry = name

    utils.addEntry(this._config, entry)

    if (this._isHot)
      utils.addHotEntries(this._config.entry)

    return this
  },

  raw(fn) {
    typeof fn === 'function'
      ? fn(this._config)
      : merge(this._config, fn, concat)
    return this
  },

  output(filePath, publicPath) {
    filePath = path.resolve(filePath);

    this._config.output = {
      filename: path.basename(filePath),
      path: path.dirname(filePath)
    }

    if (publicPath)
      this._config.output.publicPath = publicPath;

    return this
  },

  use(...fns) {
    fns.forEach(fn => fn && fn(this))
    return this
  },

  isHot(fn) {
    if (this._isHot) fn(this)
    return this
  },

  hot(reload = true) {
    return this
      .notInProduction(() => {
        let entry = this._config.entry;

        if (reload && !this._isHot) {
          let plugin = new webpack.HotModuleReplacementPlugin();

          this._isHot = true
          this.replacePlugin('$$hmr', plugin)

          if (entry)
            utils.addHotEntries(entry)
        }
        else if (!reload && this._isHot) {
          this._isHot = false
          if (!entry) return this
          utils.removeHotEntries(entry)
          this.removePlugin('$$hmr')
        }
      })
  },

  define(pathOrObject, value) {
    let defines = this._defines;
    let stringify = obj => deepTransform(obj, val => JSON.stringify(val))

    if (typeof pathOrObject === 'string') {
      value = JSON.stringify(value)
      set(defines, pathOrObject, value)
    }
    else {
      merge(defines, stringify(pathOrObject))
    }

    this.replacePlugin('$$define', new webpack.DefinePlugin(defines))

    return this
  },

  onResolve(fn) {
    if (typeof fn === 'function')
      this._onResolve.push(fn);
    return this
  },

  resolve() {
    validate(this._config)
    this._onResolve.forEach(fn => fn(this._config))

    // validate again since the onResolve hooks
    // may have changed something
    validate(this._config)

    return this._config
  }
}

inject.loader(fluent)
inject.plugin(fluent)
inject.resolve(fluent)
inject.env(fluent)

function deepTransform(obj, fn) {
  return transform(obj, (result, val, key) => {
    if (val != null) {
      if (typeof val === 'object' && !(val instanceof RegExp)) {
        val = deepTransform(val, fn)
      }
      else {
        val = fn(val, key)
      }
    }
    result[key] = val
  },
  Array.isArray(obj) ? [] : {})
}
