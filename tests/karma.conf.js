'use strict';
module.exports = function (config) {
  config.set({
    basePath: '../',
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
    client: {
      captureConsole: true,
      mocha: {'ui': 'tdd'}
    },
    envPreprocessor: [
      'TEST_ENV'
    ],
    files: [
      'tests/**/*.test.js',
      { pattern: 'examples/_sounds/click.ogg', included: false, served: true }
    ],
    frameworks: ['mocha', 'sinon-chai', 'chai-shallow-deep-equal',
                 'browserify'],
    preprocessors: {
      'tests/**/*.js': ['browserify', 'env']
    },
    reporters: ['mocha']
  });
};
