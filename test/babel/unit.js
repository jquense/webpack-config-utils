import webpack from 'webpack';
import configure from '../../src'
import babel from '../../src/babel'
import * as testUtils from '../../test-helpers'

import chai from 'chai'

let expect = chai.expect;
chai.should()

describe('babel preset', function() {
  beforeEach(() => {
    process.env.NODE_ENV = null
  })

  it('should be usable', () => {
    configure()
      .use(babel)
      .resolve()
  })

  it('should transpile code', () => {
    let config = require('./fixtures/config')

    return testUtils
      .run(config, true)
      .then(({ fs }) => {
        let contents = fs.readFileSync(__dirname + '/output/bundle.js').toString('utf8')
        contents.should
          .contain("var foo = 'bar';")
          .contain("var b = 6;")
      })
  })
})
