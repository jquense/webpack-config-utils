import webpack from 'webpack';
import configure from '../../src'
import basic from '../../src/basic'
import * as testUtils from '../../test-helpers'
import chai from 'chai'

let expect = chai.expect;
chai.should()

describe('basic preset', function() {

  beforeEach(() => {
    process.env.NODE_ENV = null
  })

  it('should be usable', () => {
    configure()
      .use(basic)
      .resolve()
  })

  it('should add extensions', ()=> {
    let config = configure().use(basic).resolve();

    config.resolve.extensions
      .should.contain('.json')
  })

  it('should add bower components', ()=> {
    let config = configure().use(basic).use(basic).resolve();

    config.resolve.modulesDirectories
      .should.eql(['web_modules', 'node_modules', 'bower_components'])
  })

  it('should be have dedupe plugin', () => {
    testUtils.hasPlugin(
      configure().use(basic),
      webpack.optimize.DedupePlugin
    ).should.equal(false)

    testUtils.env('production', ()=> {
      testUtils.hasPlugin(
        configure().use(basic),
        webpack.optimize.DedupePlugin
      ).should.equal(true)
    })
  })

  it('should be have OccurenceOrderPlugin', () => {
    testUtils.hasPlugin(
      configure().use(basic),
      webpack.optimize.OccurenceOrderPlugin
    ).should.equal(true)
  })

  it('should be have CommonsChunkPlugin', () => {
    testUtils.hasPlugin(
      configure().use(basic),
      webpack.optimize.CommonsChunkPlugin
    ).should.equal(true)
  })

  it('should be have Uglify plugin in prod', () => {
    testUtils.hasPlugin(
      configure().use(basic),
      webpack.optimize.UglifyJsPlugin
    ).should.equal(false)

    testUtils.env('production', ()=> {
      testUtils.hasPlugin(
        configure().use(basic),
        webpack.optimize.UglifyJsPlugin
      ).should.equal(true)
    })
  })

  it('should be have appropriate source map setting', () => {

    configure().use(basic).resolve().devtool
      .should.equal('cheap-module-eval-source-map')

    testUtils.env('test', ()=> {
      configure().use(basic).resolve().devtool
        .should.equal('inline-source-map')
    })

    testUtils.env('production', ()=> {
      configure().use(basic).resolve().devtool
        .should.equal('source-map')
    })
  })

  it('create output files', () => {
    let config = require('./fixtures/config')

    return testUtils
      .run(config, true)
      .then(({ output }) => {
        output.should
          .contain('bundle.js')
          .contain('common.bundle.js')
      })
  })

})
