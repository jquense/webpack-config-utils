import path from 'path';
import get from 'lodash/object/get';
import set from 'lodash/object/set';
import trimLeft from 'lodash/string/trimLeft';

const DEFAULT_MODULE_DIRECTORIES = ["web_modules", "node_modules"]

export default function resolve(obj) {

  obj.ARRAY_DEDUPE_KEYS.push('root', 'extensions', 'modulesDirectories')

  Object.assign(obj, {

    extension(...exts) {
      return this.raw({
        resolve: {
          extensions: exts.map(ext => ('.' + trimLeft(ext, '.')))
        }
      })
    },

    root(...dirs) {
      dirs = dirs.map(dir =>
        path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir))

      return this.raw({
        resolve: {
          root: dirs
        }
      })
    },

    alias(alias, module) {
      return this.raw({
        resolve: {
          alias: {
            [alias]: module
          }
        }
      })
    },

    modules(...modules) {
      return this.raw({
        resolve: {
          modulesDirectories: DEFAULT_MODULE_DIRECTORIES.concat(modules)
        }
      })
    }
  })


  obj.extensions = obj.extension
}
