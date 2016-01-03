import chai from 'chai'
import capitalize from 'lodash/string/capitalize'
import validate from '../src/config/validate.js'
import escape from 'escape-regexp';

let expect = chai.expect;

chai.should()


describe('config validations', ()=> {

  function reports(config, ...lineMatches) {
    let match = lineMatches
      .map(m => m.source || escape(m))
      .join('[^]+')

    if (match) match = new RegExp(match, 'gmi')
    expect(()=> validate(config)).to.throw(match)
  }

  describe('output', ()=> {
    it('should catch non-differentiated filenames with multiple entries', () => {
      let config = {
        entry: {
          app: './app.js',
          vendor: './vendor.js'
        },
        output: {
          filename: 'bundle.js'
        }
      }
      reports(config,
        'You have specified multiple entry points',
        'such as: "bundle.[name].js"'
      )
    })
  })
})
