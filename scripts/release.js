var fs = require('fs');
var glob = require('glob');

var prevVersion = process.argv[2];
var nextVersion = process.argv[3];

if (!prevVersion || !nextVersion) {
  console.error('Error: you must pass in the old version and new version: ' +
                '(e.g., `node scripts/release.js 0.3.0 0.4.0`)');
  process.exit(1);
}

// Copy `aframe.js` to `aframe-v{newVersion}js`.
glob.sync('dist/aframe-master*', {
  exclude: `dist/aframe*v${prevVersion}*`
}).forEach(function copyMasterToStable (masterFilename) {
  var stableFilename = masterFilename.replace('master', `v${nextVersion}`);
  fs.createReadStream(masterFilename).pipe(fs.createWriteStream(stableFilename));
});

// Remove `aframe-v{prevVersion}.js`.
glob.sync(`dist/aframe*v${prevVersion}*`).forEach(fs.unlinkSync);

// Replace instances of version in documentation and README.
var versionRegex = new RegExp(`${prevVersion}`, 'g');
glob.sync('docs/**/*.md').forEach(updateDoc);
glob.sync('README.md').forEach(updateDoc);
function updateDoc (docFilename) {
  var contents = fs.readFileSync(docFilename, 'utf-8');
  if (versionRegex.exec(contents)) {
    contents = contents.replace(versionRegex, nextVersion);
    fs.writeFileSync(docFilename, contents);
  }
}
