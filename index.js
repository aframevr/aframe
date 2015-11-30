var aframeCore = require('@mozvr/aframe-core');
var coreElements = require('./elements/');
var css = require('./style/index.css');
var pkg = require('./package');
var registerTemplate = require('./elements/lib/register-template');

module.exports = {
  // Main library.
  aframeCore: aframeCore,

  // Custom elements.
  elements: {
    core: coreElements
  },

  // Boilerplate styles.
  css: css,

  // Register custom elements.
  registerTemplate: registerTemplate,

  // Package version.
  version: pkg.version
};
