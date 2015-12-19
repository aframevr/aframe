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
  DIST: 'dist/aframe.js',
  BUILD: 'build/aframe.js',
  WATCH: '{elements,examples,lib,src}/**/*',
  PORT: 9000
};

var opts = {
  debug: process.env.NODE_ENVIRONMENT !== 'production',
  verbose: true,
  open: process.env.OPEN,  // To enable: `OPEN=1 npm start`
  live: process.env.LIVE,  // To enable: `LIVE=1 npm start`
  stream: process.stdout,
  host: process.env.HOST,
  port: process.env.PORT || consts.PORT,
  browserifyArgs: ['-s', consts.NAME],
  middleware: function (req, res, next) {
    // Route `dist/aframe.js` to `build/aframe.js` so we can
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

app.watch(consts.WATCH)
.on('update', function () {
  execCmd('semistandard -v $(git ls-files "*.js") | snazzy');
});

if (opts.live) {
  app.live()
  .on('watch', function (eventType, fn) {
    if (eventType !== 'change' && eventType !== 'add') { return; }
    app.reload(fn);
  })
  .on('pending', function () {
    app.reload(opts.output);
  });
}
