require('../style/aframe-core.css');
require('../style/rStats.css');
var debug = require('./utils/debug');
var registerElement = require('./a-register-element');

var AEntity = require('./core/a-entity');
var ANode = require('./core/a-node');
var AScene = require('./core/a-scene');

// Required after `AEntity` so that all components are registered.
var AComponents = require('./core/components').components;

// Exports THREE to the window object so three.js can be used without alteration.
var THREE = window.THREE = require('../lib/three');

var pkg = require('../package');
var utils = require('./utils/');

// Webvr polyfill configuration.
window.WebVRConfig = {
  TOUCH_PANNER_DISABLED: true,
  MOUSE_KEYBOARD_CONTROLS_DISABLED: true
};
require('webvr-polyfill');

require('./core/a-animation');
require('./core/a-assets');
require('./core/a-cubemap');
require('./core/a-mixin');
require('./core/a-scene');

module.exports = {
  AComponents: AComponents,
  AEntity: AEntity,
  ANode: ANode,
  AScene: AScene,
  debug: debug,
  registerElement: registerElement,
  THREE: THREE,
  utils: utils,
  version: pkg.version
};
