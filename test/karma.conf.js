'use strict';
module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai', 'chai-shallow-deep-equal', 'browserify'],
    browserify: {
      debug: true,
      paths: ['src']
    },
    browsers: ['firefox_latest'],
    customLaunchers: {
      firefox_latest: {
        base: 'FirefoxNightly',
        prefs: { /* empty */ }
      }
    },
    reporters: ['mocha'],
    client: {
      captureConsole: true,
      mocha: {'ui': 'tdd'}
    },
    basePath: '../',
    files: [
      'test/*.js'
    ],
    preprocessors: {
      'test/*.js': ['browserify']
    }
  });
};
