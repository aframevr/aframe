// Polyfill `Promise`.
window.Promise = window.Promise || require('promise-polyfill');

require('present'); // Polyfill `performance.now()`.
// CSS.
require('./style/aframe.css');
require('./style/rStats.css');

// Required before `AEntity` so that all components are registered.
var AScene = require('./core/scene/a-scene');
var components = require('./core/component').components;
var registerComponent = require('./core/component').registerComponent;
var registerGeometry = require('./core/geometry').registerGeometry;
var registerPrimitive = require('./extras/primitives/registerPrimitive');
var registerShader = require('./core/shader').registerShader;
var registerSystem = require('./core/system').registerSystem;
var shaders = require('./core/shader').shaders;
var systems = require('./core/system').systems;
// Exports THREE to window so three.js can be used without alteration.
var THREE = window.THREE = require('./lib/three');
var TWEEN = window.TWEEN = require('tween.js');

var pkg = require('../package');
var utils = require('./utils/');

require('./components/index'); // Register standard components.
require('./geometries/index'); // Register standard geometries.
require('./shaders/index'); // Register standard shaders.
require('./systems/index'); // Register standard systems.
var ANode = require('./core/a-node');
var AEntity = require('./core/a-entity'); // Depends on ANode and core components.

window.hasNativeWebVRSupport = !!navigator.getVRDevices || !!navigator.getVRDisplays;
window.WebVRConfig = window.WebVRConfig || {
  TOUCH_PANNER_DISABLED: true,
  MOUSE_KEYBOARD_CONTROLS_DISABLED: true,
  ENABLE_DEPRECATED_API: true,
  BUFFER_SCALE: 0.5
};
require('webvr-polyfill');

require('./core/a-animation');
require('./core/a-assets');
require('./core/a-cubemap');
require('./core/a-mixin');

// Extras.
require('./extras/components/');
require('./extras/declarative-events/');
require('./extras/primitives/');

console.log('A-Frame Version:', pkg.version);
console.log('three Version:', pkg.dependencies['three']);
console.log('WebVR Polyfill Version:', pkg.dependencies['webvr-polyfill']);

module.exports = window.AFRAME = {
  AEntity: AEntity,
  ANode: ANode,
  AScene: AScene,
  components: components,
  registerComponent: registerComponent,
  registerGeometry: registerGeometry,
  registerPrimitive: registerPrimitive,
  registerShader: registerShader,
  registerSystem: registerSystem,
  shaders: shaders,
  systems: systems,
  THREE: THREE,
  TWEEN: TWEEN,
  utils: utils,
  version: pkg.version
};
