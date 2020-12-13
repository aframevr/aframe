#!/usr/bin/env node
let fs = require('fs');
let glob = require('glob');

glob.sync('tests/**/*.test.js').forEach(testFile => {
  let contents = fs.readFileSync(testFile, 'utf-8');
  if (contents.indexOf('test.only') !== -1 || contents.indexOf('suite.only') !== -1) {
    console.error('[PRE-PUSH HOOK ERROR] Please remove `test.only` or `suite.only` from tests!');
    process.exit(1);
  }
});
