#!/usr/bin/env node

var exec = require('child_process').exec;
var fs = require('fs');
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
  host: '0.0.0.0',
  port: 9000,
  browserifyArgs: '-s aframe'.split(' ')
});

app
.watch('**/*.{css,js,html}')
// .live()
.on('watch', function (eventType, fn) {
  if (eventType !== 'change' && eventType !== 'add') { return; }

  if (path.extname(fn) === '.css') {
    // We want to trigger a reload of the entire document, since
    // browserify-css injects CSS into the page.
    app.reload();
  } else if (path.extname(fn) === '.js') {
    app.reload(fn);
  } else if (fn.indexOf('elements/templates') === 0) {
    var templatesWriteStream = fs.createWriteStream('./build/aframe.html');
    var p = exec('vulcanize --inline elements/templates/index.html').stdout;
    p.pipe(templatesWriteStream);
    p.on('end', function () {
      app.reload('build/aframe.html');
    });
    templatesWriteStream.on('error', function (err) {
      console.error('Could not vulcanize HTML templates: %s', err);
    });
  }
}).on('update', function (ev) {
  execCmd('semistandard -v $(git ls-files "*.js") | snazzy');
});
