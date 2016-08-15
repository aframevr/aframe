var transforms = [];
if (process.env.CI) {
  transforms.push([
    'browserify-istanbul', {
      instrumenterConfig: {
        embedSource: true
      },
      defaultIgnore: true,
      ignore: ['**/node_modules/**', '**/tests/**', '**/vendor/**', '**/*.css']
    }
  ]);
}

module.exports = function (config) {
  config.set({
    basePath: '../',
    browserify: {
      debug: true,
      paths: ['src'],
      transform: transforms,
    },
    browsers: ['firefox_latest', 'Chrome'],
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
      // Define test files.
      {pattern: 'tests/**/*.test.js'},
      // Serve test assets.
      {pattern: 'tests/assets/**/*', included: false, served: true}
    ],
    frameworks: ['mocha', 'sinon-chai', 'chai-shallow-deep-equal', 'browserify'],
    preprocessors: {
      'tests/**/*.js': ['browserify', 'env'],
      'src/**/*.js': ['coverage']
    },
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      dir: 'tests/coverage',
      includeAllSources: true,
      reporters: [
        {'type': 'html', subdir: 'report'},
        {'type': 'lcov', subdir: '.'}
      ]
    }
  });
};
