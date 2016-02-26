// Polyfill `Promise`.
var promise = require('promise-polyfill');
if (!global.Promise) {
  global.Promise = promise;
}
 
require('present');  // Polyfill `performance.now()`.

// CSS.
require('./style/aframe.css');
require('./style/rStats.css');

// Required before `AEntity` so that all components are registered.
var AScene = require('./core/scene/a-scene');
var components = require('./core/component').components;
var debug = require('./utils/debug');
var registerComponent = require('./core/component').registerComponent;
var registerElement = require('./core/a-register-element');
// Exports THREE to window so three.js can be used without alteration.
var THREE = window.THREE = require('./lib/three');
var TWEEN = window.TWEEN = require('tween.js');

var pkg = require('../package');
var utils = require('./utils/');

require('./components/index');  // Register core components.
var ANode = require('./core/a-node');
var AEntity = require('./core/a-entity');  // Depends on ANode and core components.

// Webvr polyfill configuration.
window.hasNonPolyfillWebVRSupport = !!navigator.getVRDevices;
window.WebVRConfig = {
  TOUCH_PANNER_DISABLED: true,
  MOUSE_KEYBOARD_CONTROLS_DISABLED: true
};
require('webvr-polyfill');

require('./core/a-animation');
require('./core/a-assets');
require('./core/a-cubemap');
require('./core/a-mixin');

// Extras.
require('./extras/declarative-events/');
require('./extras/primitives/');

console.log('A-Frame Version:', pkg.version);
console.log('three-dev Version:', pkg.dependencies['three-dev']);
console.log('WebVR Polyfill Version:', pkg.dependencies['webvr-polyfill']);

module.exports = window.AFRAME = {
  AEntity: AEntity,
  ANode: ANode,
  AScene: AScene,
  components: components,
  debug: debug,
  registerComponent: registerComponent,
  registerElement: registerElement,
  THREE: THREE,
  TWEEN: TWEEN,
  utils: utils,
  version: pkg.version
};
