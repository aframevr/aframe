var execSync = require('child_process').execSync;
var fs = require('fs');
var glob = require('glob');
var pkg = require('../package.json');

var prevVersion = process.argv[2];
var nextVersion = process.argv[3];

if (!prevVersion || !nextVersion) {
  console.error('Error: you must pass in the old version and new version: ' +
                '(e.g., `node scripts/release.js 0.3.0 0.4.0`)');
  process.exit(1);
}

let distModule;
let distMin;
let distMax;
if (process.env.FOR_RELEASE) {
  distModule = `${pkg.scripts['dist:module']} --output-filename aframe.module.min.js`;
  distMin = `${pkg.scripts['dist:min']} --output-filename aframe.min.js`;
  distMax = `${pkg.scripts['dist:max']} --output-filename aframe.js`;
} else {
  distModule = `${pkg.scripts['dist:module']} --output-filename aframe-v${nextVersion}.module.min.js`;
  distMin = `${pkg.scripts['dist:min']} --output-filename aframe-v${nextVersion}.min.js`;
  distMax = `${pkg.scripts['dist:max']} --output-filename aframe-v${nextVersion}.js`;
}

execSync(distModule, {stdio: 'inherit'});
execSync(distMin, {stdio: 'inherit'});
execSync(distMax, {stdio: 'inherit'});

// Remove `aframe-v{prevVersion}.js`.
glob.sync(`dist/aframe*v${prevVersion}*`).forEach(fs.unlinkSync);

// Replace instances of version in documentation and README.
var versionRegex = new RegExp(`${prevVersion.replace(/\./g, '\\.')}`, 'g');
glob.sync('docs/**/*.md').forEach(updateDoc);
glob.sync('README.md').forEach(updateDoc);
function updateDoc (docFilename) {
  var contents = fs.readFileSync(docFilename, 'utf-8');
  if (versionRegex.exec(contents)) {
    contents = contents.replace(versionRegex, nextVersion);
    fs.writeFileSync(docFilename, contents);
  }
}
