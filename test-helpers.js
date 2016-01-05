var webpack = require('webpack');
var MemoryFileSystem = require("memory-fs");
import path from 'path';
import { expect } from 'chai'
import configure from './src';
import contains from 'lodash/collection/contains';

let resolve = c => c && typeof c.resolve === 'function' ? c.resolve() : c;

export function hasLoader(config, loader) {
  config = resolve(config)
  if (typeof loader !== 'string') return false
  return config.module.loaders.some(l =>
    [].concat(l.loader || l.loaders)
      .some(name => contains(name, loader))
  )
}

export function hasPlugin(config, plugin) {
  config = resolve(config)
  if (typeof plugin !== 'function') return false
  return config.plugins.some(p =>
    p.constructor === plugin
  )
}

export function compare(builder, config) {
  expect(builder.resolve()).to.eql(
    configure(config || {}).resolve()
  )
}

export function run(config, assert) {
  return new Promise((resolve, reject) => {
    let compiler = webpack(config)
    let fs = compiler.outputFileSystem = new MemoryFileSystem();

    compiler.run(function (err, stats) {
      if (err) return reject(err)
      let errors = stats.compilation.errors || [];
      if (assert) expect(errors.length).to.equal(0, errors.join('\n'))

      resolve({
        fs,
        output: getOutputFiles(fs, config.output.path),
        stats,
        errors,
        warnings: stats.compilation.warnings || []
      })
    })
  })
}

function getOutputFiles(fs, dir) {
  let files = []
  dir = path.normalize(dir)
  getFiles(dir)

  return files.map(f => path.normalize(f).replace(dir + path.sep, ''))

  function getFiles(dir) {
    fs.readdirSync(dir).forEach(filename => {
      let file = path.join(dir, filename)
      if (fs.statSync(file).isDirectory())
        getFiles(file)
      else
        files.push(file)
    })
  }
}

export function env(name, fn) {
  let current = process.env.NODE_ENV;

  process.env.NODE_ENV = name;
  let result = fn()
  process.env.NODE_ENV = current;
  return result;
}
