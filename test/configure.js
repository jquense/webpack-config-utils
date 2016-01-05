import chai from 'chai'
import path from 'path'
import capitalize from 'lodash/string/capitalize'
import configure from '../src/config/configure.js'
import { compare } from '../test-helpers';

let expect = chai.expect;

chai.should()



describe('creating configs', () => {

  it('should add an entry', () => {

    compare(
      configure()
        .entry(__dirname + '/index.es6.js')
        .entry('vendor', ['lodash', 'react'])

      , {
        entry: {
          test: __dirname + '/index.es6.js',
          vendor: ['lodash', 'react'],
        }
      }
    )
  }),

  it('should clone config', () => {
    let configA = configure().loader('json')
      , configB = configA.clone()

    expect(configA).to.not.equal(configB)

    expect(configA).to.eql(configB)
    expect(configA._loaders).to.not.equal(configB._loaders)
  })

  describe('loaders', () => {
    ['loader', 'preLoader', 'postLoader'].forEach(type => {

      let add = type
        , remove = 'remove' + capitalize(type)
        , replace = 'replace' + capitalize(type)

      it('should add a ' + type + ' by name', () => {

        compare(
          configure()[add]('json')
          , {
            module: {
              loaders: [
                {
                  loader: require.resolve('json-loader'),
                  test: /\.(json)$/i,
                  exclude: [/node_modules/]
                },
              ]
            }
          }
        )
      })


      it('should add a ' + type + ' via an object', () => {

        compare(
          configure()
            [add]('js', { loader: 'babel', test: /\.(js)/ })
            [add]('styles', { loader: 'css', test: /\.(css)/ })
          , {
            module: {
              loaders: [
                { loader: require.resolve('babel-loader'), test: /\.(js)/ },
                { loader: require.resolve('css-loader'), test: /\.(css)/ }
              ]
            }
          }
        )
      })

      it('should add a ' + type + ' via a builder', () => {

        compare(
          configure()
            [add]('js', builder =>
              builder('babel').ext('js'))

          , {
            module: {
              loaders: [
                {
                  loader: require.resolve('babel-loader'),
                  test: /\.(js)$/i,
                  exclude: [/node_modules/]
                }
              ]
            }
          }
        )
      })

      it('should add multiple ' + type + 's via an array', () => {

        compare(
          configure()
            [add]('styles', [
              { loader: 'style', test: /\.(css)/ },
              { loader: 'css', test: /\.(css)/ }
            ])
            [add]('js', { loader: 'babel', test: /\.(js)/ })
          , {
            module: {
              loaders: [
                { loader: require.resolve('style-loader'), test: /\.(css)/ },
                { loader: require.resolve('css-loader'), test: /\.(css)/ },
                { loader: require.resolve('babel-loader'), test: /\.(js)/ }
              ]
            }
          }
        )
      })

      it('should add multiple ' + type + 's via a builder', () => {

        compare(
          configure()
            [add]('js', builder =>
              builder(
                'css', l => l('babel').query({ stage: 0 })
              )
              .ext('js'))

          , {
            module: {
              loaders: [
                {
                  loader: require.resolve('css-loader'),
                  test: /\.(js)$/i,
                  exclude: [/node_modules/]
                },
                {
                  loader: require.resolve('babel-loader'),
                  query: { stage: 0 },
                  test: /\.(js)$/i,
                  exclude: [/node_modules/]
                }
              ]
            }
          }
        )
      })

      it('should throw with an existing a ' + type, () => {
        expect(() => configure()
          [add]('styles', { loader: 'babel', test: /\.(js)/ })
          [add]('styles', { loader: 'css', test: /\.(css)/ })
          .resolve()
        )
        .to.throw(/There is already a (post|pre)?loader or set of (post|pre)?loaders by this name/i)
      })

      it('should replace a ' + type, () => {

        compare(
          configure()
            [add]('styles', { loader: 'css', test: /\.(css)/ })
            [add]('js', { loader: 'babel', test: /\.(js)/ })
            [replace]('styles', { loader: 'style!css', test: /\.(css)/ })
          , {
            module: {
              loaders: [
                {
                  loader: ['style-loader','css-loader'].map(require.resolve).join('!'),
                  test: /\.(css)/
                },
                { loader: require.resolve('babel-loader'), test: /\.(js)/ }
              ]
            }
          }
        )
      })

      it('should replace a set of ' + type + 's', () => {

        compare(
          configure()
            [add]('styles', [
              { loader: 'style', test: /\.(css)/ },
              { loader: 'css', test: /\.(css)/ }
            ])
            [add]('js', { loader: 'babel', test: /\.(js)/ })
            [replace]('styles', { loader: 'style!css', test: /\.(css)/ })
          , {
            module: {
              loaders: [
                {
                  loader: ['style-loader','css-loader'].map(require.resolve).join('!'),
                  test: /\.(css)/
                },
                { loader: require.resolve('babel-loader'), test: /\.(js)/ }
              ]
            }
          }
        )
      })

    })
  })

  describe('environments', ()=> {
    let env;

    beforeEach(()=> env = process.env.NODE_ENV)
    afterEach(() => process.env.NODE_ENV = env)

    it('should apply when in the environment', ()=> {
      let called = 0;
      process.env.NODE_ENV = 'myenv'

      configure().inEnv('myenv', ()=> called++)
      configure().notInEnv('myenv', ()=> called++)

      expect(called).to.equal(1)
    })

    it('should allow aliasing built-in envs', ()=> {
      let called = 0;

      process.env.NODE_ENV = 'staging'

      configure()
        .env('production', 'staging')
        .inEnv('production', ()=> called++)
        .notInEnv('production', ()=> called++)

      process.env.NODE_ENV = 'dev-staging'

      configure()
        .env('production', ['staging', 'dev-staging'])
        .inEnv('production', ()=> called++)
        .notInEnv('production', ()=> called++)

      expect(called).to.equal(2)
    })

    it('should have built in convenience methods', ()=> {
      ['Production', 'Test', 'Development'].forEach(env => {
        configure()['in' + env].should.be.a('function')
        configure()['notIn' + env].should.be.a('function')
      })
    })
  })

  it('should add extensions', () => {
    compare(
      configure()
        .extension('.jsx', 'es6', 'js')
    , {
      resolve: {
        extensions: ['', '.js', '.jsx', '.es6']
      }
    })
  })

  it('should define roots', () => {
    compare(
      configure()
        .root('./config', './config', path.resolve(__dirname, '../basic'))
    , {
      resolve: {
        root: [
          path.resolve('./config'),
          path.resolve('./basic')
        ]
      }
    })
  })

  it('should define aliases', () => {
    compare(
      configure()
        .alias('bl', 'css-loader')
        .alias('bl', 'babel-loader')
    , {
      resolve: {
        alias: {
          bl: 'babel-loader'
        }
      }
    })
  })

  it('should add defines', () => {

    configure()
      .define('process.env.MY_ENV', true)
      .define({
        process: {
          env: {
            NODE_ENV: 'production'
          }
        }
      })
      ._defines.should.eql({
        process: {
          env: {
            MY_ENV: 'true',
            NODE_ENV: '"production"'
          }
        }
      })
  })
})
