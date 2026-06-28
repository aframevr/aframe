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

// Track which HTML files had at least one link replaced, so the CodeSandbox
// style below is only injected into the examples we actually modified.
const modifiedFiles = new Set();

function htmlReplace (before, after) {
  const results = replaceInFileSync({
    from: before,
    to: after,
    files: 'gh-pages/**/*.html'
  });
  results.filter(result => result.hasChanged).forEach(result => modifiedFiles.add(result.file));
}

htmlReplace('../../../dist/aframe-master.module.min.js', `https://aframe.io/releases/${aframeVersion}/aframe.module.min.js`);
htmlReplace('../../../dist/aframe-master.js', `https://aframe.io/releases/${aframeVersion}/aframe.min.js`);
htmlReplace(/\.\.\/\.\.\/\.\.\/super-three-package/g, `https://cdn.jsdelivr.net/npm/super-three@${threeVersion}`);

// Move the CodeSandbox "Open Sandbox" button to the top so it does not overlap
// the VR/AR enter buttons, but only in the examples where a link was replaced.
if (modifiedFiles.size > 0) {
  replaceInFileSync({
    from: '</head>',
    to: `  <style>
      iframe[id^="sb__open-sandbox"] {
        inset: 16px auto auto 16px;
      }
    </style>
  </head>`,
    files: Array.from(modifiedFiles)
  });
}
