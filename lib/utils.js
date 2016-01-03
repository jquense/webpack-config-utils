'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.ensureConfig = ensureConfig;
exports.addEntry = addEntry;
exports.resolveLoader = resolveLoader;
exports.addLoader = addLoader;
exports.addPlugin = addPlugin;
exports.tryParseQuery = tryParseQuery;
exports.addHotEntries = addHotEntries;
exports.removeHotEntries = removeHotEntries;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsonic = require('jsonic');

var _jsonic2 = _interopRequireDefault(_jsonic);

var _lodashObjectHas = require('lodash/object/has');

var _lodashObjectHas2 = _interopRequireDefault(_lodashObjectHas);

var _lodashObjectSet = require('lodash/object/set');

var _lodashObjectSet2 = _interopRequireDefault(_lodashObjectSet);

var _lodashObjectGet = require('lodash/object/get');

var _lodashObjectGet2 = _interopRequireDefault(_lodashObjectGet);

var _lodashObjectAssign = require('lodash/object/assign');

var _lodashObjectAssign2 = _interopRequireDefault(_lodashObjectAssign);

var _lodashObjectDefaultsDeep = require('lodash/object/defaultsDeep');

var _lodashObjectDefaultsDeep2 = _interopRequireDefault(_lodashObjectDefaultsDeep);

var webpackDevServerAddress = 'http://' + _ip2['default'].address() + ':' + (process.env.PORT || 8080);

var HOT_ENTRY = 'webpack/hot/dev-server';
var DEV_ENTRY = 'webpack-dev-server/client?' + webpackDevServerAddress;

function ensureConfig(config) {
  if (!config) throw new Error("You didn't provide a config object to the config preset");

  return (0, _lodashObjectDefaultsDeep2['default'])(config, {
    resolve: {
      extensions: ['', 'js'],
      alias: {}
    },
    module: {
      loaders: []
    },

    plugins: []
  });
}

function addEntry(config, entry) {
  if ((0, _lodashObjectHas2['default'])(config, 'entry')) {
    if (!config.entry || config.entry === 'string') config.entry = config.entry != null ? { '': config.entry } : {};
  } else config.entry = {};

  if (typeof entry === 'string') {
    var _name = _path2['default'].basename(entry, _path2['default'].extname(entry));
    if (_name.indexOf('index') !== -1) _name = _path2['default'].basename(_path2['default'].dirname(_path2['default'].resolve(entry)));

    entry = _defineProperty({}, _name, entry);
  }

  (0, _lodashObjectAssign2['default'])(config.entry, entry);
  return config;
}

function resolveLoader(name) {
  var loader = name,
      parts = name.split('!');

  if (parts.length > 1) return parts.map(resolveLoader).join('!');

  if (loader.indexOf('loader') === -1) loader += '-loader';

  try {
    loader = require.resolve(loader);
  } catch (err) {
    loader = require.resolve(name);
  }

  return loader;
}

function addLoader(config, newLoaders, replaces) {
  if (newLoaders === undefined) newLoaders = [];

  ensureConfig(config);

  replaces = replaces || [].concat(replaces);

  var loaders = (0, _lodashObjectGet2['default'])(config, 'module.loaders'),
      idx = loaders.indexOf(replaces[0]);

  newLoaders = [].concat(newLoaders);

  newLoaders.forEach(function (loader) {
    _assert2['default'].ok((0, _lodashObjectHas2['default'])(loader, 'loader') || (0, _lodashObjectHas2['default'])(loader, 'loaders'), 'Loaders must contain a `loader` or `loaders` property.');

    _assert2['default'].ok(loader.test instanceof RegExp, 'Loaders must contain a `test` regex property.');

    if (loader.loader) loader.loader = resolveLoader(loader.loader);else loader.loaders = loader.loaders.map(resolveLoader);
  });

  if (idx !== -1) loaders.splice(idx, replaces.length);else idx = loaders.length;

  loaders.splice.apply(loaders, [idx, 0].concat(_toConsumableArray(newLoaders)));

  return newLoaders.length === 0 ? newLoaders[0] : newLoaders;
}

function addPlugin(config, plugin) {
  ensureConfig(config);
  (0, _lodashObjectGet2['default'])(config, 'plugins').push(plugin);
  return plugin;
}

function tryParseQuery(query) {
  try {
    query = (0, _jsonic2['default'])(query);
  } catch (_) {}

  return query;
}

function addHotEntries(entry) {
  Object.keys(entry).forEach(function (name) {
    var current = [].concat(entry[name]);
    if (current.indexOf(HOT_ENTRY) === -1 && current.indexOf(DEV_ENTRY) === -1) entry[name] = [HOT_ENTRY, DEV_ENTRY].concat(_toConsumableArray(current));
  });
}

function removeHotEntries(entry) {
  Object.keys(entry).forEach(function (name) {
    var current = [].concat(entry[name]),
        hotIdx = current.indexOf(HOT_ENTRY);

    if (hotIdx !== -1) current.splice(hotIdx, 1);

    var devIdx = current.indexOf(DEV_ENTRY);
    if (devIdx !== -1) current.splice(devIdx, 1);

    entry[name] = current.length === 1 ? current[0] : current;
  });
}