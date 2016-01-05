import webpack from 'webpack';
import path from 'path';
import configure from '../../src'
import assets from '../../src/assets'
import * as testUtils from '../../test-helpers'
import chai from 'chai'

let expect = chai.expect;
chai.should()

describe('asset preset', function() {
  this.timeout(10000)

  beforeEach(() => {
    process.env.NODE_ENV = null
  })

  it('should be usable', () => {
    configure()
      .use(assets)
      .resolve()
  })

  it('should optimize images in production', () => {

    return testUtils.env('production', () => {
      let config = require('./fixtures/config')

      testUtils.hasLoader(config, 'image-webpack-loader')
        .should.equal(true)

      return testUtils
        .run(config, true)
        .then(({ output, fs }) => {
          let contents = fs.readFileSync(__dirname + '/output/bundle.js').toString('utf8')

          output.should
            .contain(path.join('bundle.js'))
          .and
            .contain(path.join('fonts/asset-rw-widgets.eot'))
            .contain(path.join('fonts/asset-rw-widgets.svg'))
            .contain(path.join('fonts/asset-rw-widgets.ttf'))
          .and
            .contain(path.join('images/asset-loader.gif'))
            .contain(path.join('images/asset-loader-big.gif'))
        })
    })
  })

  it('should create output files', () => {
    let config = require('./fixtures/config')

    return testUtils
      .run(config, true)
      .then(({ output }) => {
        output.should
          .contain(path.join('bundle.js'))
        .and
          .contain(path.join('fonts/asset-rw-widgets.eot'))
          .contain(path.join('fonts/asset-rw-widgets.svg'))
          .contain(path.join('fonts/asset-rw-widgets.ttf'))
        .and
          .contain(path.join('images/asset-loader.gif'))
          .contain(path.join('images/asset-loader-big.gif'))
      })
  })

  it('should inline woff', () => {
    let config = require('./fixtures/config')

    return testUtils
      .run(config, true)
      .then(({ fs }) => {
        let contents = fs.readFileSync(__dirname + '/output/bundle.js').toString('utf8')
        contents.should.contain('module.exports = "data:application/font-woff;base64')
      })
  })

})
