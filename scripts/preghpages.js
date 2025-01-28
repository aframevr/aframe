#!/usr/bin/env node

const path = require('path');

const shell = require('shelljs');
const replaceInFileSync = require('replace-in-file').replaceInFileSync;

const pkg = require('../package.json');
const threeVersion = pkg.dependencies.three.split('@')[1];

const rootDir = path.join(__dirname, '..');

shell.cd(rootDir);

shell.rm('-rf', 'gh-pages');
shell.mkdir('-p', 'gh-pages');
shell.cp('-r', [
  '.nojekyll',
  'dist',
  'examples',
  '*.md'
], 'gh-pages');

function htmlReplace (before, after) {
  replaceInFileSync({
    from: before,
    to: after,
    files: 'gh-pages/**/*.html'
  });
}

htmlReplace('dist/aframe-master.js', 'dist/aframe-master.min.js');
htmlReplace(/\.\.\/\.\.\/\.\.\/super-three-package/g, `https://cdn.jsdelivr.net/npm/super-three@${threeVersion}`);
