// Karma configuration.
var path = require('path');
var glob = require('glob');
var webpackConfiguration = require("../webpack.config.js");

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
  glob.sync('tests/**/*.test.js').forEach(function (filename) {
    FILES.push(filename);
  });
}

// add 'src' to be able to resolve require('utils/tracked-controls') for
// example in the tests
webpackConfiguration.resolve.modules = ['src', 'node_modules'];
// webpack will create a lot of files, use build directory instead of dist
webpackConfiguration.output.path = path.resolve(__dirname, '../build');

var karmaConf = {
  basePath: '../',
  webpack: webpackConfiguration,
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
  frameworks: ['mocha', 'sinon-chai', 'chai-shallow-deep-equal', 'webpack'],
  preprocessors: {
    'tests/**/*.js': ['webpack', 'env']
  },
  reporters: ['mocha']
};

// Configuration for code coverage reporting.
if (process.env.TEST_ENV === 'ci') {
  // modify the babel-loader rule
  karmaConf.webpack.module.rules[0].use.options = {
    plugins: [['istanbul', { 'exclude': ['**/node_modules/**', '**/tests/**', '**/vendor/**', '**/*.css'] }]]
  };
  karmaConf.coverageReporter = {
    dir: 'tests/coverage',
    includeAllSources: true,
    reporters: [
      {'type': 'html', subdir: 'report'},
      {'type': 'lcov', subdir: '.'}
    ]
  };
  karmaConf.reporters.push('coverage');
  karmaConf.browsers = ['Firefox', 'ChromeTravis'];
}

if (process.env.NO_BROWSER) {
  delete karmaConf.browsers;
}

// Apply configuration.
module.exports = function (config) {
  config.set(karmaConf);
};
