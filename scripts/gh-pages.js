#!/usr/bin/env node

/**
 * Fancy script to deploy to GitHub Pages
 * ======================================
 *
 * Sample usage
 * ------------
 *
 * % node ./scripts/gh-pages
 * gh-pages -d dist -r git@github.com:MozVR/aframe.git
 *
 * % node ./scripts/gh-pages cvan
 * gh-pages -d dist -r git@github.com:cvan/aframe.git
 *
 * % node ./scripts/gh-pages git@github.com:dmarcos/aframe.git
 * gh-pages -d dist -r git@github.com:dmarcos/aframe.git
 *
 */

var spawn = require('child_process').spawn;

var ghpages = require('gh-pages');
var path = require('path');

var repo = {
  username: 'MozVR',
  name: 'aframe'
};

var arg = process.argv[2];
if (arg) {
  if (arg.indexOf(':') === -1) {
    repo.username = arg;
  } else {
    repo.url = arg;
    var usernameMatches = arg.match(':(.+)/');
    if (usernameMatches) {
      repo.username = usernameMatches[1];
    }
  }
}

if (!repo.url) {
  repo.url = 'git@github.com:' + repo.username + '/' + repo.name + '.git';
}

repo.ghPagesUrl = 'https://' + repo.username + '.github.io/' + repo.name + '/';

console.log('Publishing to', repo.url);

ghpages.clean();  // Wipe out the checkout from scratch every time in case we change repos.
ghpages.publish(path.join(process.cwd(), 'gh-pages'), {
  repo: repo.url,
  dotfiles: true,
  logger: function (message) {
    console.log(message);
  }
}, function () {
  console.log('Published');
  console.log(repo.ghPagesUrl);
  spawn('open', [repo.ghPagesUrl]);
});
