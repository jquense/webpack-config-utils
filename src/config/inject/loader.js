import assert from 'assert';

import get from 'lodash/object/get';
import capitalize from 'lodash/string/capitalize'
import trimRight from 'lodash/string/trimRight';

import * as utils from '../utils';
import loaderBuilder from '../loader';

const REPLACE = 'replace';
const ADJUST = 'adjust';

export default function injectLoaders(obj) {

  ['', 'pre', 'post'].forEach(type => {
    let suffix = type ? (type + 'Loader') : 'loader';
    let name = prefix => (prefix || '') + (prefix ? capitalize(suffix): suffix)

    let add = name()
      , adjust = name('adjust')
      , replace = name('replace')
      , remove = name('remove')
      , field = '_' + add + 's'

    let ensureField = ctx => ctx[field] || (ctx[field] = {})

    obj.ARRAY_DEDUPE_KEYS.push(add + 's')

    Object.assign(obj, {

      [add](name, loader, _action) {
        let builder
          , current = ensureField(this)[name];

        assert(!(current && !_action),
            'There is already a ' + add + ' or set of ' + add + 's by this name: "' + name + '". '
          + 'use `' + replace + '()` to override an existing loader or `' + adjust + '()` or edit this one.'
        );

        if (!loader || loader === true) {
          loader = loaderBuilder(name).for(trimRight(name, '-loader'))
        }

        if (loader) {
          let currentLoader = current && current.loader;

          current = current && (current.builder || current.loader);

          if (typeof loader === 'function') {

            builder = _action === ADJUST
              ? loader(current)
              : loader(loaderBuilder, current);
          }
          else if (loader.resolve) {
            builder = loader
          }


          if (builder && builder.resolve) {
            if (!builder._loaders.length)
              builder.set(name)

            loader = builder.resolve()
          }

          loader = utils.addLoader(
              get(this, '_config.module.loaders')
            , loader
            , currentLoader
          )

          ensureField(this)[name] = {
            builder,
            loader
          }
        }

        return this
      },

      [replace](name, loader) {
        return this[add](name, loader, REPLACE)
      },

      [adjust](name, loader) {
        return this[add](name, loader, ADJUST)
      },

      [remove](name) {
        let loaders = ensureField(this)[name]
        delete loaders[name];
        remove(this._config.module.loaders, loaders.loader)
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
