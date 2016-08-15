// karma configuration
var karma_conf = {
  basePath: '../',
  browserify: {
    debug: true,
    paths: ['src']
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
    'tests/**/*.js': ['browserify', 'env']
  },
  reporters: ['mocha']
};

// configuration for code coverage reporting
if (process.env.TEST_ENV === 'ci') {
  Object.assign(karma_conf.browserify, {
    transform: [
      [
        'browserify-istanbul', {
          instrumenterConfig: {
            embedSource: true
          },
          defaultIgnore: true,
          ignore: ['**/node_modules/**', '**/tests/**', '**/vendor/**', '**/*.css']
        }
      ]
    ]
  });
  karma_conf.coverageReporter = {
    dir: 'tests/coverage',
    includeAllSources: true,
    reporters: [
      {'type': 'html', subdir: 'report'},
      {'type': 'lcov', subdir: '.'}
    ]
  };
  karma_conf.reporters.push('coverage');
  karma_conf.preprocessors['src/**/*.js'] = ['coverage'];
}

// Apply configuration
module.exports = function (config) {
  config.set(karma_conf);
};
