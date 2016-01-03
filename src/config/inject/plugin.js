import assert from 'assert';
import * as utils from '../utils';
import get from 'lodash/object/get';

export default function injectPlugin(obj) {

  return Object.assign(obj, {

    plugin(name, plugin, _replace) {
      let current = this._plugins[name];

      assert(!(current && _replace === false),
          'There is already a plugin or set of plugins by this name: "' + name + '". '
        + 'use `replacePlugin()` to override an existing plugin'
      );

      this._plugins[name] = utils.addPlugin(
        get(this, '_config.plugins'), plugin)

      return this
    },

    replacePlugin(name, plugin) {
      this.plugin(name, plugin, true)
      return this
    },

    removePlugin(name) {
      let plugins = this._plugins[name]
      delete this._plugins[name];

      remove(this._config.plugins, plugins)
      return this
    },
  })
}

function remove(arr, items) {
  if (!items) return

  [].concat(items).forEach(item => {
    let idx = arr.indexOf(item)
    if (idx === -1) arr.splice(idx, 1)
  })
}
