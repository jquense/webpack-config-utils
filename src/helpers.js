

export function createPreset(fn){
  return function preset(options) {
    if (!options || options._config)
      return fn.call({ options: {} }, options)

    return fn.bind({ options })
  }
}
