var VRMarkup = require('@mozvr/vr-markup');
var core = require('./core/');
var css = require('./style/index.css');

module.exports = {
  // Main library.
  VRMarkup: VRMarkup,

  // Core components.
  core: core,

  // Boilerplate styles.
  css: css
};
