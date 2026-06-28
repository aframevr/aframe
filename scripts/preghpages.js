#!/usr/bin/env node

const path = require('path');

const shell = require('shelljs');
const replaceInFileSync = require('replace-in-file').replaceInFileSync;

const pkg = require('../package.json');
const aframeVersion = pkg.version;

// Take the super-three version from the released tag's package.json, not from
// master, so the gh-pages examples reference the three version that shipped
// with this A-Frame release.
const taggedPkg = JSON.parse(
  shell.exec(`git show v${aframeVersion}:package.json`, { silent: true }).stdout
);
const threeVersion = taggedPkg.dependencies.three.split('@')[1];

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

htmlReplace('../../../dist/aframe-master.module.min.js', `https://aframe.io/releases/${aframeVersion}/aframe.module.min.js`);
htmlReplace('../../../dist/aframe-master.js', `https://aframe.io/releases/${aframeVersion}/aframe.min.js`);
htmlReplace(/\.\.\/\.\.\/\.\.\/super-three-package/g, `https://cdn.jsdelivr.net/npm/super-three@${threeVersion}`);
htmlReplace(/\.\.\/\.\.\/js\//g, 'https://cdn.jsdelivr.net/gh/aframevr/aframe@gh-pages/examples/js/');
htmlReplace(/\.\.\/\.\.\/assets\//g, 'https://cdn.jsdelivr.net/gh/aframevr/aframe@gh-pages/examples/assets/');
