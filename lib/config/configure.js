'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = create;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _lodashStringTrimRight = require('lodash/string/trimRight');

var _lodashStringTrimRight2 = _interopRequireDefault(_lodashStringTrimRight);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _loader2 = require('./loader');

var _loader3 = _interopRequireDefault(_loader2);

function create(defaults) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var config = _extends(Object.create(fluent), {
    _config: utils.ensureConfig(defaults || {}),
    options: options,
    _loaders: {},
    _plugins: {}
  });

  Object.defineProperty(config, 'valueOf', {
    value: fluent.resolve
  });

  return config;
}

var fluent = {

  entry: function entry(name, _entry) {
    if (arguments.length === 2) _entry = _defineProperty({}, name, _entry);else _entry = name;

    utils.addEntry(this._config, _entry);

    if (this._isHot) utils.addHotEntries(this._config.entry);

    return this;
  },

  raw: function raw(fn) {
    typeof fn === 'function' ? fn(this._config) : _extends(this._config, fn);
    return this;
  },

  output: function output(filePath, publicPath) {
    filePath = _path2['default'].resolve(filePath);

    this._config.output = {
      filename: _path2['default'].basename(filePath),
      path: _path2['default'].dirname(filePath)
    };

    if (publicPath) this._config.output.publicPath = publicPath;

    return this;
  },

  use: function use() {
    var _this = this;

    for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    fns.forEach(function (fn) {
      return fn && fn(_this);
    });
    return this;
  },

  isHot: function isHot() {
    return !!this._isHot;
  },

  isProduction: function isProduction() {
    return process.env.NODE_ENV === 'production';
  },

  hot: function hot() {
    var reload = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    var entry = this._config.entry;

    if (reload && !this._isHot) {
      var plugin = new _webpack2['default'].HotModuleReplacementPlugin();

      this._isHot = true;
      this.plugin('hmr', plugin);

      if (entry) utils.addHotEntries(entry);
    } else if (!reload && this._isHot) {
      this._isHot = false;
      if (!entry) return this;
      utils.removeHotEntries(entry);
      this.removePlugin('hmr');
    }

    return this;
  },

  loader: function loader(name, _loader, _replace) {
    var current = this._loaders[name];

    if (!_loader || _loader === true) {
      ext = (0, _lodashStringTrimRight2['default'])(name, '-loader');
      _loader = (0, _loader3['default'])(name)['for'](ext).resolve();
    }

    (0, _assert2['default'])(!current || _replace === true, 'There is already a loader or set of loaders by this name: "' + name + '". ' + 'use `replaceLoader()` to override an existing loader');

    if (_loader) {
      if (typeof _loader === 'function') {
        _loader = _loader(_loader3['default'], current);
        _loader = _loader.resolve ? _loader.resolve() : _loader;
      }

      this._loaders[name] = utils.addLoader(this._config, _loader, current);
    }

    return this;
  },

  replaceLoader: function replaceLoader(name, loader) {
    return this.loader(name, loader, true);
  },

  removeLoader: function removeLoader(name) {
    var loaders = this._loaders[name];
    delete this._loaders[name];
    remove(this._config.module.loaders, loaders);
    return this;
  },

  plugin: function plugin(name, _plugin) {
    if (_plugin) this._plugins[name] = utils.addPlugin(this._config, _plugin);
    return this;
  },

  removePlugin: function removePlugin(name) {
    var plugins = this._plugins[name];
    delete this._plugins[name];

    remove(this._config.plugins, plugins);
    return this;
  },

  resolve: function resolve() {
    return this._config;
  }
};

function remove(arr, items) {
  if (!items) return;

  [].concat(items).forEach(function (item) {
    var idx = arr.indexOf(item);
    if (idx === -1) arr.splice(idx, 1);
  });
}
module.exports = exports['default'];