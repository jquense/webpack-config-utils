'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = buildLoader;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashStringTrimLeft = require('lodash/string/trimLeft');

var _lodashStringTrimLeft2 = _interopRequireDefault(_lodashStringTrimLeft);

var _lodashArrayFindIndex = require('lodash/array/findIndex');

var _lodashArrayFindIndex2 = _interopRequireDefault(_lodashArrayFindIndex);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _escapeRegexp = require('escape-regexp');

var _escapeRegexp2 = _interopRequireDefault(_escapeRegexp);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var canChain = function canChain(l) {
  return typeof l === 'string' || l && !l._query;
};
var toSingle = function toSingle(l) {
  return {
    _query: l._query,
    _loaders: [l.loader || l]
  };
};

function validateStringLoader(str) {
  (0, _assert2['default'])(str.indexOf('!') === -1, 'Loader modules should be specified individually without the "!"; ' + 'instead pass each loader name as a seperate argument: \n\n' + 'change: `("' + str + '")` to: `(' + str.split('!').map(function (s) {
    return '"' + s + '"';
  }).join(', ') + ')` ');

  return str;
}

function regexEqual(x, y) {
  if (typeof x === 'string' && typeof y === 'string') return x === y;else if (x instanceof RegExp && !(y instanceof RegExp)) return x.source === y;else if (!(x instanceof RegExp) && y instanceof RegExp) return x === y.source;

  return x instanceof RegExp && y instanceof RegExp && x.source === y.source && x.global === y.global && x.ignoreCase === y.ignoreCase && x.multiline === y.multiline;
}

function lilBuilder(loader) {
  var _query = undefined;

  validateStringLoader(loader);

  if (loader.indexOf('?') !== -1) {
    var parts = loader.split('?');
    loader = parts.shift();
    _query = parts.join('?');
  }

  return _extends(Object.create({
    query: loaderBuilder.query
  }), { loader: loader, _query: _query });
}

var loaderBuilder = {
  using: function using() {
    for (var _len = arguments.length, loaders = Array(_len), _key = 0; _key < _len; _key++) {
      loaders[_key] = arguments[_key];
    }

    this._loaders = this._loaders.concat(loaders.map(function (loader) {

      if (typeof loader === 'function') {
        return loader(lilBuilder);
      }

      loader = lilBuilder(loader);

      if (canChain(loader)) loader = loader.loader;

      return loader;
    }));
    return this;
  },

  query: function query(_query2) {
    this._query = utils.tryParseQuery(_query2);
    return this;
  },

  include: function include() {
    var _this = this;

    for (var _len2 = arguments.length, includes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      includes[_key2] = arguments[_key2];
    }

    includes.forEach(function (include) {
      var idx = (0, _lodashArrayFindIndex2['default'])(_this._excludes, function (exclude) {
        return regexEqual(include, exclude);
      });

      if (idx !== -1) _this._excludes.splice(idx, 1);
    });

    this._includes = this._includes.concat(includes);

    return this;
  },

  exclude: function exclude() {
    var _this2 = this;

    for (var _len3 = arguments.length, excludes = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      excludes[_key3] = arguments[_key3];
    }

    excludes.forEach(function (exclude) {
      var idx = (0, _lodashArrayFindIndex2['default'])(_this2._includes, function (include) {
        return regexEqual(include, exclude);
      });

      if (idx !== -1) _this2._includes.splice(idx, 1);
    });

    this._excludes = this._excludes.concat(excludes);

    return this;
  },

  ext: function ext() {
    for (var _len4 = arguments.length, exts = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      exts[_key4] = arguments[_key4];
    }

    exts = exts.map(function (ext) {
      _assert2['default'].ok(typeof ext === 'string', 'extension names must be strings');
      return (0, _lodashStringTrimLeft2['default'])(ext, '.');
    });

    this._exts = this._exts.concat(exts);
    return this;
  },

  resolve: function resolve() {
    var _this3 = this;

    var result = {};
    var loaders = this._loaders;

    _assert2['default'].ok(loaders.length, 'No loader module provided! Provide a loader with `using()` to point to a local ' + 'loader module');

    if (loaders.length > 1 && !loaders.every(canChain)) {
      return loaders.map(function (loader) {
        return _extends(buildLoader(), _this3, toSingle(loader)).resolve();
      });
    }

    var innerQuery = loaders[0]._query;
    if (innerQuery) this.query(innerQuery);

    loaders = loaders.map(function (l) {
      return typeof l === 'string' ? l : l.loader;
    });

    if (loaders.length === 1) result.loader = loaders[0];else result.loaders = loaders;

    _assert2['default'].ok(this._exts.length || this._tests.length, 'All loaders must match some file type with ext(), or contain a test()');

    result.test = new RegExp('\\.(' + this._exts.map(_escapeRegexp2['default']).join('|') + ')$', 'i');

    if (this._includes.length) result.include = this._includes;

    if (this._excludes.length) result.exclude = this._excludes;

    if (this._query) result.query = this._query;

    return result;
  }
};

loaderBuilder['for'] = loaderBuilder.ext;

function buildLoader() {
  var builder = _extends(Object.create(loaderBuilder), {
    _loaders: [],
    _tests: [],
    _exts: [],
    _includes: [],
    _excludes: [/node_modules/]
  });

  for (var _len5 = arguments.length, loaders = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    loaders[_key5] = arguments[_key5];
  }

  if (loaders.length) builder.using.apply(builder, loaders);

  return builder;
}

module.exports = exports['default'];