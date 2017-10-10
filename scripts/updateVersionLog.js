const fs = require('fs');
const gitRev = require('git-rev');

const pkg = require('../package.json');

// Read file.
const contents = fs.readFileSync('./src/index.js', 'utf-8');

// Update log message in index.js.
const timestamp = getBuildTimestamp();
gitRev.short(hash => {
  const newContents = contents.replace(
    /console.log\('A-Frame Version:.*\)/,
    `console.log('A-Frame Version: ${pkg.version} (Date ${timestamp}, Commit #${hash})')`);
  fs.writeFileSync('./src/index.js', newContents);
});

/**
 * @returns {string} of format `1-1-2017`.
 */
function getBuildTimestamp () {
  function pad2 (value) {
    return ('0' + value).slice(-2);
  }
  const date = new Date();
  const timestamp = [
    pad2(date.getUTCDate()),
    pad2(date.getUTCMonth() + 1),
    date.getUTCFullYear()
  ];
  return timestamp.join('-');
}
