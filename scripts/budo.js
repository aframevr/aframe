#!/usr/bin/env node

var exec = require('child_process').exec;
var path = require('path');

var budo = require('budo');

function execCmd (cmd) {
  var p = exec(cmd);
  p.stderr.pipe(process.stderr);
  p.stdout.pipe(process.stdout);
  return p;
}

var app = budo('./index.js:build/aframe.js', {
  debug: process.env.NODE_ENVIRONMENT !== 'production',
  verbose: true,
  stream: process.stdout,  // log to stdout
  port: 9000,
  browserifyArgs: '-s AFRAME'.split(' ')
});

app
.watch('**/*.{css,js,html}')
.live()
.on('watch', function (eventType, fn) {
  if (eventType !== 'change' && eventType !== 'add') { return; }
  if (path.extname(fn) === '.css') {
    // We want to trigger a reload of the entire document, since
    // browserify-css injects CSS into the page.
    app.reload();
  } else if (path.extname(fn) === '.js') {
    app.reload(fn);
  } else if (fn.indexOf('elements/templates') === 0) {
    app.reload();
  }
}).on('update', function (ev) {
  execCmd('semistandard -v $(git ls-files "*.js") | snazzy');
});
