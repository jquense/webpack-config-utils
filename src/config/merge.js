import each from 'lodash/collection/each'

function mergeLoaders(target, source) {
  let tLoaders = target._loaders
    , sLoaders = source._loaders;


}

function mergeTwo(target, source) {

}

export default function mergeConfig(...configs) {
  configs.reduce((target, source) => {
    target._loaders = Object.assign(target._loaders, source._loaders)
    target._plugins = Object.assign(target._plugins, source._plugins)
  })
}
