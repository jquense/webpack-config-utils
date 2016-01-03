import pick from 'lodash/object/pick';
import capitalize from 'lodash/string/capitalize'

const BUILT_IN = ['production', 'test', 'development'];

export default function (obj) {

  function isEnv(ctx, env) {
    let envs = ctx._envs = ctx._envs || (ctx._envs = {})
    let names = envs[env]

    return [env].concat(names)
      .some(env => process.env.NODE_ENV === env)
  }

  function setAliases(ctx, name, aliases) {
    let envs = ctx._envs = ctx._envs || (ctx._envs = {})

    if (arguments.length === 1)
      return assign(envs, pick(name, BUILT_IN))

    envs[name] = [].concat(aliases)
  }

  Object.assign(obj, {

    env(builtin, name) {
      if (typeof name === 'function')
        return this.inEnv(builtin, name)

      setAliases(this, builtin, name)
      return this
    },

    inEnv(envName, fn) {
      if (isEnv(this, envName)) fn(this)
      return this
    },

    notInEnv(envName, fn) {
      if (!isEnv(this, envName)) fn(this)
      return this
    },
  })

  BUILT_IN.forEach(env => {
    Object.assign(obj, {
      ['in' + capitalize(env)](fn) {
        return this.inEnv(env, fn)
      },
      ['notIn' + capitalize(env)](fn) {
        return this.notInEnv(env, fn)
      }
    })
  })
}
