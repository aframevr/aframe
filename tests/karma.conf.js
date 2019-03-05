// Karma configuration.
var glob = require('glob');

// Define test files.
var FILES = [
  // Serve test assets.
  'tests/__init.test.js',
  {pattern: 'tests/assets/**/*', included: false, served: true}
];
if (process.env.TEST_FILE) {
  glob.sync('tests/**/*.test.js').forEach(function (filename) {
    if (filename.toLowerCase().indexOf(process.env.TEST_FILE.toLowerCase()) !== -1) {
      FILES.push(filename);
    }
  });
} else {
  FILES.push('tests/**/*.test.js');
}

var karmaConf = {
  basePath: '../',
  browserify: {
    debug: true,
    paths: ['src']
  },
  browsers: ['Firefox', 'Chrome'],
  customLaunchers: {
    ChromeTravis: {
      base: 'Chrome',
      flags: ['--no-sandbox']
    }
  },
  client: {
    captureConsole: true,
    mocha: {ui: 'tdd'}
  },
  envPreprocessor: [
    'TEST_ENV'
  ],
  files: FILES,
  frameworks: ['mocha', 'sinon-chai', 'chai-shallow-deep-equal', 'browserify'],
  preprocessors: {
    'tests/**/*.js': ['browserify', 'env']
  },
  reporters: ['mocha']
};

// Configuration for code coverage reporting.
if (process.env.TEST_ENV === 'ci') {
  Object.assign(karmaConf.browserify, {
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
  karmaConf.coverageReporter = {
    dir: 'tests/coverage',
    includeAllSources: true,
    reporters: [
      {'type': 'html', subdir: 'report'},
      {'type': 'lcov', subdir: '.'}
    ]
  };
  karmaConf.reporters.push('coverage');
  karmaConf.preprocessors['src/**/*.js'] = ['coverage'];
  karmaConf.browsers = ['Firefox', 'ChromeTravis'];
}

if (process.env.NO_BROWSER) {
  delete karmaConf.browsers;
}

// Apply configuration.
module.exports = function (config) {
  config.set(karmaConf);
};
