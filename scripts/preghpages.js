#!/usr/bin/env node

const path = require('path');

const shell = require('shelljs');
const replace = require('replace');

// Inject `<meta>` tag for Chrome for Android's WebVR Origin Trial:
// https://webvr.rocks/chrome_for_android#what_is_the_webvr_origin_trial
const originTrialMetaTag = `
  <meta http-equiv="origin-trial" data-feature="WebVR" data-origin="aframe.io" data-expires="2017-06-12" content="AtVfgsTpKNW5uNMWhhsORulpdxd0il6DEK0Xt2MF+z+QNgXelR4cKKJYdKfwJN/4xqakgwmg0BXd8Xn7WijlmggAAABbeyJvcmlnaW4iOiJodHRwczovL2FmcmFtZS5pbzo0NDMiLCJmZWF0dXJlIjoiV2ViVlIiLCJleHBpcnkiOjE0OTczMTIwMDAsImlzU3ViZG9tYWluIjp0cnVlfQ==">
`.trim();
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
  replace({
    regex: before,
    replacement: after,
    paths: [
      'gh-pages'
    ],
    include: '*.html',
    recursive: true,
    silent: true
  });
}

htmlReplace('dist/aframe-master.js', 'dist/aframe-master.min.js');
htmlReplace('<head>', `<head>\n    ${originTrialMetaTag}`);
