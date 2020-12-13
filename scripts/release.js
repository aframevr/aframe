let execSync = require('child_process').execSync;
let fs = require('fs');
let glob = require('glob');
let pkg = require('../package.json');

let prevVersion = process.argv[2];
let nextVersion = process.argv[3];

if (!prevVersion || !nextVersion) {
  console.error('Error: you must pass in the old version and new version: ' +
                '(e.g., `node scripts/release.js 0.3.0 0.4.0`)');
  process.exit(1);
}

let distMin;
let distMax;
if (process.env.FOR_RELEASE) {
  distMin = pkg.scripts['dist:min'].replace(/-master/g, '');
  distMax = pkg.scripts['dist:max'].replace(/-master/g, '');
} else {
  distMin = pkg.scripts['dist:min'].replace(/master/g, `v${nextVersion}`);
  distMax = pkg.scripts['dist:max'].replace(/master/g, `v${nextVersion}`);
}

execSync(distMin, {stdio: 'inherit'});
execSync(distMax, {stdio: 'inherit'});

// Remove `aframe-v{prevVersion}.js`.
glob.sync(`dist/aframe*v${prevVersion}*`).forEach(fs.unlinkSync);

// Replace instances of version in documentation and README.
let versionRegex = new RegExp(`${prevVersion.replace(/\./g, '\\.')}`, 'g');
glob.sync('docs/**/*.md').forEach(updateDoc);
glob.sync('README.md').forEach(updateDoc);
function updateDoc (docFilename) {
  let contents = fs.readFileSync(docFilename, 'utf-8');
  if (versionRegex.exec(contents)) {
    contents = contents.replace(versionRegex, nextVersion);
    fs.writeFileSync(docFilename, contents);
  }
}
