require('babel/register');


var reporters = ;

module.exports = function (config) {
  config.set({

    basePath: '',

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/index.js'
    ],

    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },

    webpackMiddleware: {
      noInfo: true
    },

    reporters: ['mocha'],

    port: 9876,
    colors: true,
    logLevel: 'INFO',
    browsers: [ 'Chrome' ],
  });
};
