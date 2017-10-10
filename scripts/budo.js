#!/usr/bin/env node

var exec = require('child_process').exec;
var urlParse = require('url').parse;

var budo = require('budo');

function execCmd (cmd) {
  var p = exec(cmd);
  p.stderr.pipe(process.stderr);
  p.stdout.pipe(process.stdout);
  return p;
}

var consts = {
  NAME: 'AFRAME',
  ENTRY: './src/index.js',
  DIST: 'dist/aframe-master.js',
  BUILD: 'build/aframe-master.js',
  WATCH: 'examples/**/*',  // Additional files to watch for LiveReload
  PORT: 9000
};

var opts = {
  debug: process.env.NODE_ENVIRONMENT !== 'production',
  verbose: true,
  live: true,
  stream: process.stdout,
  host: process.env.HOST,
  port: process.env.PORT || consts.PORT,
  watchGlob: consts.WATCH,
  browserifyArgs: ['-s', consts.NAME],
  middleware: function (req, res, next) {
    // Route `dist/aframe-master.js` to `build/aframe-master.js` so we can
    // dev against the examples :)
    var path = urlParse(req.url).pathname;
    if (path.indexOf('/' + consts.DIST) !== -1) {
      req.url = req.url.replace('/dist/', '/build/');
    }
    // TODO: Consider adding middleware that targets specific directories
    // (such that editing `examples/a.html` doesn't reload `examples/b.html`).
    next();
  }
};

var app = budo(consts.ENTRY + ':' + consts.BUILD, opts);
app.on('update', function () {
  execCmd('semistandard -v | snazzy');
});
