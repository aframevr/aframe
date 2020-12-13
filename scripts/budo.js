#!/usr/bin/env node

let exec = require('child_process').exec;
let urlParse = require('url').parse;

let budo = require('budo');

function execCmd (cmd) {
  let p = exec(cmd);
  p.stderr.pipe(process.stderr);
  p.stdout.pipe(process.stdout);
  return p;
}

let consts = {
  NAME: 'AFRAME',
  ENTRY: './src/index.js',
  DIST: 'dist/aframe-master.js',
  BUILD: 'build/aframe-master.js',
  WATCH: 'examples/**/*',  // Additional files to watch for LiveReload
  PORT: 9000
};

let opts = {
  debug: process.env.NODE_ENVIRONMENT !== 'production',
  verbose: true,
  live: true,
  stream: process.stdout,
  host: process.env.HOST,
  port: process.env.PORT || consts.PORT,
  watchGlob: consts.WATCH,
  ssl: process.env.SSL,
  browserifyArgs: ['-s', consts.NAME],
  middleware: function (req, res, next) {
    // Route `dist/aframe-master.js` to `build/aframe-master.js` so we can
    // dev against the examples :)
    let path = urlParse(req.url).pathname;
    if (path.indexOf('/' + consts.DIST) !== -1) {
      req.url = req.url.replace('/dist/', '/build/');
    }
    // TODO: Consider adding middleware that targets specific directories
    // (such that editing `examples/a.html` doesn't reload `examples/b.html`).
    next();
  }
};

let app = budo(consts.ENTRY + ':' + consts.BUILD, opts);
app.on('update', function () {
  execCmd('semistandard -v | snazzy');
});
