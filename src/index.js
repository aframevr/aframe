// Check before the polyfill runs.
window.hasNativeWebVRImplementation = !!window.navigator.getVRDisplays || !!window.navigator.getVRDevices;

window.WebVRConfig = window.WebVRConfig || {
  BUFFER_SCALE: 1,
  CARDBOARD_UI_DISABLED: true,
  ROTATE_INSTRUCTIONS_DISABLED: true,
  TOUCH_PANNER_DISABLED: true,
  MOUSE_KEYBOARD_CONTROLS_DISABLED: true
};

// WebVR polyfill
require('webvr-polyfill');

var utils = require('./utils/');

var debug = utils.debug;
var error = debug('A-Frame:error');
var warn = debug('A-Frame:warn');

if (window.document.currentScript && window.document.currentScript.parentNode !==
    window.document.head && !window.debug) {
  warn('Put the A-Frame <script> tag in the <head> of the HTML *before* the scene to ' +
       'ensure everything for A-Frame is properly registered before they are used from ' +
       'HTML.');
}

// Error if not using a server.
if (window.location.protocol === 'file:') {
  error(
    'This HTML file is currently being served via the file:// protocol. ' +
    'Assets, textures, and models WILL NOT WORK due to cross-origin policy! ' +
    'Please use a local or hosted server: ' +
    'https://aframe.io/docs/0.5.0/introduction/getting-started.html#using-a-local-server.');
}

// Polyfill `Promise`.
window.Promise = window.Promise || require('promise-polyfill');

// Workaround for iOS Safari canvas sizing issues in stereo (webvr-polyfill/issues/102).
// Only for iOS on versions older than 10.
if (utils.device.isIOSOlderThan10(window.navigator.userAgent)) {
  window.WebVRConfig.BUFFER_SCALE = 1 / window.devicePixelRatio;
}

require('present'); // Polyfill `performance.now()`.

// CSS.
if (utils.device.isBrowserEnvironment) {
  require('./style/aframe.css');
  require('./style/rStats.css');
}

// Required before `AEntity` so that all components are registered.
var AScene = require('./core/scene/a-scene').AScene;
var components = require('./core/component').components;
var registerComponent = require('./core/component').registerComponent;
var registerGeometry = require('./core/geometry').registerGeometry;
var registerPrimitive = require('./extras/primitives/primitives').registerPrimitive;
var registerShader = require('./core/shader').registerShader;
var registerSystem = require('./core/system').registerSystem;
var shaders = require('./core/shader').shaders;
var systems = require('./core/system').systems;
// Exports THREE to window so three.js can be used without alteration.
var THREE = window.THREE = require('./lib/three');
var TWEEN = window.TWEEN = require('@tweenjs/tween.js');

var pkg = require('../package');

require('./components/index'); // Register standard components.
require('./geometries/index'); // Register standard geometries.
require('./shaders/index'); // Register standard shaders.
require('./systems/index'); // Register standard systems.
var ANode = require('./core/a-node');
var AEntity = require('./core/a-entity'); // Depends on ANode and core components.

require('./core/a-animation');
require('./core/a-assets');
require('./core/a-cubemap');
require('./core/a-mixin');

// Extras.
require('./extras/components/');
require('./extras/primitives/');

console.log('A-Frame Version: 0.8.0 (Date 2018-03-09, Commit #9e6da8c)');
console.log('three Version:', pkg.dependencies['three']);
console.log('WebVR Polyfill Version:', pkg.dependencies['webvr-polyfill']);

module.exports = window.AFRAME = {
  AComponent: require('./core/component').Component,
  AEntity: AEntity,
  ANode: ANode,
  AScene: AScene,
  components: components,
  geometries: require('./core/geometry').geometries,
  registerComponent: registerComponent,
  registerElement: require('./core/a-register-element').registerElement,
  registerGeometry: registerGeometry,
  registerPrimitive: registerPrimitive,
  registerShader: registerShader,
  registerSystem: registerSystem,
  primitives: {
    getMeshMixin: require('./extras/primitives/getMeshMixin'),
    primitives: require('./extras/primitives/primitives').primitives
  },
  scenes: require('./core/scene/scenes'),
  schema: require('./core/schema'),
  shaders: shaders,
  systems: systems,
  THREE: THREE,
  TWEEN: TWEEN,
  utils: utils,
  version: pkg.version
};
