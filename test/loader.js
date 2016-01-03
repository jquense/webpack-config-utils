import chai from 'chai'
import loader from '../src/config/loader.js'

let expect = chai.expect;

chai.should()

describe('loader builder', () => {
  it('should create a simple loader', () => {

    expect(
      loader('babel')
        .ext('js', 'jsx')
        .resolve()
    ).to.eql(
      {
          loader: 'babel',
          test: /\.(js|jsx)$/i,
          exclude: [/node_modules/]
      }
    )
  })

  it('should create a single chained loader with strings', () => {

    expect(
      loader('react-hot', 'babel')
        .ext('js', 'jsx')
        .resolve()
    ).to.eql(
      {
          loaders: ['react-hot', 'babel'],
          test: /\.(js|jsx)$/i,
          exclude: [/node_modules/]
      }
    )
  })

  it('should create a single chained loader with strings', () => {

    expect(
      loader('react-hot', l => l('babel'))
        .ext('js', 'jsx')
        .resolve()
    ).to.eql(
      {
          loaders: ['react-hot', 'babel'],
          test: /\.(js|jsx)$/i,
          exclude: [/node_modules/]
      }
    )
  })
  it('should create a single chained loader single fn loader', () => {

    expect(
      loader(l => l('babel').query({ stage: 0 }))
        .for('js', 'jsx')
        .resolve()
    ).to.eql(
      {
          loader: 'babel',
          query: { stage: 0 },
          test: /\.(js|jsx)$/i,
          exclude: [/node_modules/]
      }
    )
  })

  it('should create multiple equivalent loaders when needed', () => {
    expect(
      loader('react-hot', l => l('babel').query({ stage: 0 }))
        .ext('js', 'jsx')
        .resolve()
    ).to.eql([
      { loader: 'react-hot', test: /\.(js|jsx)$/i, exclude: [/node_modules/] },
      { loader: 'babel', test: /\.(js|jsx)$/i, exclude: [/node_modules/], query: { stage: 0 } },
    ])
  })

  it('should parse out query', () => {
    expect(loader('babel?stage=0').ext('js').resolve())
      .to.eql({
        loader: 'babel',
        test: /\.(js)$/i,
        exclude: [/node_modules/],
        query: 'stage=0'
      })

    expect(loader(l => l('babel?{stage: 0}')).for('js').resolve())
      .to.eql({
        loader: 'babel',
        test: /\.(js)$/i,
        exclude: [/node_modules/],
        query: { stage: 0 }
      })
  })

  it('should throw when trying to chain with !', () => {
    expect(() => loader('react-hot!babel').resolve())
      .to.throw(/change: `\("react-hot!babel"\)` to: `\("react-hot", "babel"\)`/)
  })

  it('should throw when missing loaders', () => {
    expect(() => loader().resolve())
      .to.throw(/No loader module provided!/)
  })

  it('should throw when missing tests', () => {
    expect(() => loader('babel').resolve())
      .to.throw(/All loaders must match some file type/)
  })

  it('should remove exclude when included', () => {
    expect(
      loader('babel').ext('js')
        .include("node_modules")
        .resolve()
    ).to.eql({
        loader: 'babel',
        test: /\.(js)$/i,
        include: ["node_modules"]
    })
  })

  it('should remove include when excluded', () => {
    let ldr = loader('babel')
      .ext('js')
      .include(/foo/)

    expect(ldr.resolve()).to.eql({
        loader: 'babel',
        test: /\.(js)$/i,
        exclude: [/node_modules/],
        include: [/foo/]
    })

    expect(ldr.exclude(/foo/).resolve()).to.eql({
        loader: 'babel',
        test: /\.(js)$/i,
        exclude: [/node_modules/, /foo/]
    })
  })

})
