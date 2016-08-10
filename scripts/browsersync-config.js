/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */

var urllib = require('url');
var urlParse = urllib.parse;
function isEnabled (val) {
  val = val || '';
  return val !== '' && val !== '0' && val !== 'false' && val !== 'off';
}

function getEnvVar (name, defaultVal) {
  return name in process.env ? isEnabled(name) : defaultVal;
}

var opts = {
  server: {baseDir: './'},
  middleware: [
    function (req, res, next) {
      // Route `dist/aframe.js` to `build/aframe.js` so we can
      // dev against the examples :)
      var path = urlParse(req.url).pathname;
      if (path.indexOf('/' + 'dist/aframe.js') !== -1) {
        req.url = req.url.replace('/dist/', '/build/');
      }
      next();
    }
  ],
  rewriteRules: [],
  files: ['build/aframe.js'],
  watchOptions: {ignoreInitial: true},
  open: getEnvVar('BS_OPEN', false),
  notify: getEnvVar('BS_NOTIFY', false),
  tunnel: getEnvVar('BS_TUNNEL', false),
  minify: getEnvVar('BS_MINIFY', false)
};

module.exports = opts;
