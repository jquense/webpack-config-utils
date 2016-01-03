import assert from 'assert';

import get from 'lodash/object/get';
import capitalize from 'lodash/string/capitalize'
import trimRight from 'lodash/string/trimRight';

import * as utils from '../utils';
import loaderBuilder from '../loader';

export default function injectLoaders(obj) {

  ['', 'pre', 'post'].forEach(type => {
    let suffix = type ? (type + 'Loader') : 'loader';
    let name = prefix => (prefix || '') + (prefix ? capitalize(suffix): suffix)

    let add = name()
      , replace = name('replace')
      , remove = name('remove')
      , field = '_' + add + 's'

    let ensureField = ctx => ctx[field] || (ctx[field] = {})

    Object.assign(obj, {

      [add](name, loader, _replace) {
        let current = ensureField(this)[name];

        if (!loader || loader === true) {
          loader = loaderBuilder(name)
            .for(trimRight(name, '-loader'))
            .resolve()
        }

        assert(!(current && _replace !== true),
            'There is already a ' + add + ' or set of ' + add + 's by this name: "' + name + '". '
          + 'use `' + replace + '()` to override an existing loader'
        );

        if (loader) {
          if (typeof loader === 'function') {
            loader = loader(loaderBuilder, current)
            loader = loader.resolve ? loader.resolve() : loader
          }

          ensureField(this)[name] = utils.addLoader(
            get(this, '_config.module.loaders'), loader, current)
        }

        return this
      },

      [replace](name, loader) {
        return this[add](name, loader, true)
      },

      [remove](name) {
        let loaders = ensureField(this)[name]
        delete loaders[name];
        remove(this._config.module.loaders, loaders)
        return this
      },
    })
  })

  return obj
}


function remove(arr, items) {
  if (!items) return

  [].concat(items).forEach(item => {
    let idx = arr.indexOf(item)
    if (idx === -1) arr.splice(idx, 1)
  })
}
