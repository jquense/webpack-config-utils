// json loader
var data = require('./data')

var pre = document.createElement('pre')

pre.innerText = JSON.stringify(data, null, 2)

document.body.appendChild(pre)
