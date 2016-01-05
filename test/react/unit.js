import webpack from 'webpack';
import configure from '../../src'
import react from '../../src/react'
import * as testUtils from '../../test-helpers'

import chai from 'chai'

let expect = chai.expect;
chai.should()

describe('react preset', function() {
  beforeEach(() => {
    process.env.NODE_ENV = null
  })

  it('should be usable', () => {
    configure()
      .use(react)
      .resolve()
  })

  it('should add react-hot-loader in hot mode', () => {
    let config = configure().use(react)

    testUtils.hasLoader(config, 'react-hot-loader')
      .should.equal(false)

    testUtils.hasLoader(config.hot(), 'react-hot-loader')
      .should.equal(true)

    testUtils.hasLoader(config.hot().hot().hot(false).hot().hot(false), 'react-hot-loader')
      .should.equal(false)
  })

  it('should transpile code', () => {
    let config = require('./fixtures/config')

    return testUtils
      .run(config, true)
      .then(({ fs }) => {
        let contents = fs.readFileSync(__dirname + '/output/bundle.js').toString('utf8')
        contents.should
          .contain("React.createElement(")
      })
  })
})
