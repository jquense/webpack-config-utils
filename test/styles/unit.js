import webpack from 'webpack';
import configure from '../../src'
import styles from '../../src/styles'
import * as testUtils from '../../test-helpers'
import chai from 'chai'

let expect = chai.expect;
chai.should()

describe('styles preset', function() {

  beforeEach(() => {
    process.env.NODE_ENV = null
  })

  describe('basic', () => {
    let preset = styles;

    it('should be usable', () => {
      configure()
        .use(preset)
        .resolve()

      configure()
        .use(preset.extract)
        .resolve()
    })

    it('should be have correct loaders', () => {
      let config = configure().use(preset).resolve()

      testUtils.hasLoader(config, 'style-loader')
        .should.equal(true)
      testUtils.hasLoader(config, 'css-loader')
        .should.equal(true)
    })

    it('should be have correct loaders (extract)', () => {
      let config = configure().use(preset.extract).resolve()

      testUtils.hasLoader(config, 'extract-text-webpack')
        .should.equal(true)

      testUtils.hasLoader(config, 'css-loader')
        .should.equal(true)
    })
  })

  describe('less', () => {
    let preset = styles.less;

    it('should be usable', () => {
      configure()
        .use(preset)
        .resolve()

      configure()
        .use(preset.extract)
        .resolve()
    })

    it('should be have correct loaders', () => {
      let config = configure().use(preset).resolve()

      testUtils.hasLoader(config, 'style-loader')
        .should.equal(true)
      testUtils.hasLoader(config, 'css-loader')
        .should.equal(true)
      testUtils.hasLoader(config, 'less-loader')
        .should.equal(true)
    })

    it('should be have correct loaders (extract)', () => {
      let config = configure().use(preset.extract).resolve()

      testUtils.hasLoader(config, 'extract-text-webpack')
        .should.equal(true)
      testUtils.hasLoader(config, 'css-loader')
        .should.equal(true)
      testUtils.hasLoader(config, 'less-loader')
        .should.equal(true)
    })
  })

  describe('sass', () => {
    let preset = styles.sass;

    it('should be usable', () => {
      configure()
        .use(preset)
        .resolve()

      configure()
        .use(preset.extract)
        .resolve()
    })

    it('should be have correct loaders', () => {
      let config = configure().use(preset).resolve()

      testUtils.hasLoader(config, 'style-loader')
        .should.equal(true)
      testUtils.hasLoader(config, 'css-loader')
        .should.equal(true)
      testUtils.hasLoader(config, 'sass-loader')
        .should.equal(true)
    })

    it('should be have correct loaders (extract)', () => {
      let config = configure().use(preset.extract).resolve()

      testUtils.hasLoader(config, 'extract-text-webpack')
        .should.equal(true)
      testUtils.hasLoader(config, 'css-loader')
        .should.equal(true)
      testUtils.hasLoader(config, 'sass-loader')
        .should.equal(true)
    })
  })
})
