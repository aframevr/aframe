var aframeCore = require('aframe-core');

var coreElements = require('../elements/');
var pkg = require('../package');
var registerTemplate = require('../elements/lib/register-template');

module.exports = {
  // Main library.
  aframeCore: aframeCore,

  // Custom elements.
  elements: {
    core: coreElements
  },

  // Register custom elements.
  registerTemplate: registerTemplate,

  // Package version.
  version: pkg.version
};
