require('babel/register');

var path = require('path')
var argv = require('yargs').argv;
var open = require('open');
var Mocha = require('mocha')
var webpack = require('webpack');

var test = argv._[0];

if (!test)
  throw new Error('must include a test')

var config = require(path.join(__dirname, test, 'config.js'))


console.log(config)
var compiler = webpack(config)

if (argv.watch)
  compiler.watch({}, report)
else
  compiler.run(function(err, stats) {
    report(err, stats)
  })

var first = true;

function runServerTests(stats) {
  var test = require(path.join(__dirname, test, 'config.js'))
  var mocha = new Mocha({
    reporter: 'Spec',
    globals:
  });
}

function report(err, stats) {
  if (argv.open && first)
    open(path.join(__dirname, test, 'output/index.html'), 'chrome');

  first = false
  if (err) {
    console.error(err.stack || err)
    if (err.details) console.error(err.details)
    return process.on("exit", function () { process.exit(1) })
  }
  process.stdout.write(stats.toString() + '\n')
}

var errors = (stats.compilation.errors || []).join('\n');
var warnings = (stats.compilation.warnings || []).join('\n');
