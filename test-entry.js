var chai = require('chai')

chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))

chai.should();

var presetContext = require.context('./src', true, /\/__tests__\/.+(\.js|\.jsx)/)
var testsContext = require.context('./test', true, /\.(js|jsx)$/);

if (process.env.WEBPACK === 'presets')
  presetContext.keys().forEach(scriptsContext)
else
  testsContext.keys().forEach(testsContext)
