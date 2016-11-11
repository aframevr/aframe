var fs = require('fs');
var glob = require('glob');

var prevVersion = process.argv[2];
var nextVersion = process.argv[3];

// Copy `aframe.js` to `aframe-v{newVersion}js`.
glob.sync('dist/aframe*', {
  exclude: `dist/aframe*v${prevVersion}*`
}).forEach(function copyMasterToStable (masterFilename) {
  var stableFilename = masterFilename.replace('aframe', `aframe-v${nextVersion}`);
  fs.createReadStream(masterFilename).pipe(fs.createWriteStream(stableFilename));
});

// Remove `aframe-v{prevVersion}.js`.
glob.sync(`dist/aframe*v${nextVersion}`).forEach(fs.unlinkSync);
