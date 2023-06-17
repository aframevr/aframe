#!/usr/bin/env node

const path = require('path');

const shell = require('shelljs');
const replace = require('replace-in-file');

const rootDir = path.join(__dirname, '..');

shell.cd(rootDir);

shell.rm('-rf', 'gh-pages');
shell.mkdir('-p', 'gh-pages');
shell.cp('-r', [
  '.nojekyll',
  'dist',
  'examples',
  '*.html',
  '*.md'
], 'gh-pages');

function htmlReplace (before, after) {
  replace.sync({
    from: before,
    to: after,
    files: 'gh-pages/**/*.html'
  });
}

htmlReplace('dist/aframe-master.js', 'dist/aframe-master.min.js');
