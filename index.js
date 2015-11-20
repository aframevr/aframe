var aframeCore = require('@mozvr/aframe-core');
var coreElements = require('./elements/');
var css = require('./style/index.css');

module.exports = {
  // Main library.
  aframeCore: aframeCore,

  // Custom elements.
  elements: {
    core: coreElements
  },

  // Boilerplate styles.
  css: css
};
