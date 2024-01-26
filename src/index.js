// Polyfill `Promise`.
window.Promise = window.Promise || require('promise-polyfill');

require('@ungap/custom-elements');

// WebVR polyfill
// Check before the polyfill runs.
window.hasNativeWebVRImplementation = !!window.navigator.getVRDisplays ||
                                      !!window.navigator.getVRDevices;
window.hasNativeWebXRImplementation = navigator.xr !== undefined;

// If native WebXR or WebVR are defined WebVRPolyfill does not initialize.
if (!window.hasNativeWebXRImplementation && !window.hasNativeWebVRImplementation) {
  var isIOSOlderThan10 = require('./utils/isIOSOlderThan10');
  // Workaround for iOS Safari canvas sizing issues in stereo (webvr-polyfill/issues/102).
  // Only for iOS on versions older than 10.
  var bufferScale = isIOSOlderThan10(window.navigator.userAgent) ? 1 / window.devicePixelRatio : 1;
  var WebVRPolyfill = require('webvr-polyfill');
  var polyfillConfig = {
    BUFFER_SCALE: bufferScale,
    CARDBOARD_UI_DISABLED: true,
    ROTATE_INSTRUCTIONS_DISABLED: true,
    MOBILE_WAKE_LOCK: !!window.cordova
  };
  window.webvrpolyfill = new WebVRPolyfill(polyfillConfig);
}

var utils = require('./utils/');
var debug = utils.debug;

if (utils.isIE11) {
  // Polyfill `CustomEvent`.
  require('custom-event-polyfill');
  // Polyfill String.startsWith.
  require('../vendor/starts-with-polyfill');
}

var error = debug('A-Frame:error');
var warn = debug('A-Frame:warn');

if (window.document.currentScript && window.document.currentScript.parentNode !==
    window.document.head && !window.debug) {
  warn('Put the A-Frame <script> tag in the <head> of the HTML *before* the scene to ' +
       'ensure everything for A-Frame is properly registered before they are used from ' +
       'HTML.');
}

// Error if not using a server.
if (!window.cordova && window.location.protocol === 'file:') {
  error(
    'This HTML file is currently being served via the file:// protocol. ' +
    'Assets, textures, and models WILL NOT WORK due to cross-origin policy! ' +
    'Please use a local or hosted server: ' +
    'https://aframe.io/docs/1.4.0/introduction/installation.html#use-a-local-server.');
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

var pkg = require('../package');

require('./components/index'); // Register standard components.
require('./geometries/index'); // Register standard geometries.
require('./shaders/index'); // Register standard shaders.
require('./systems/index'); // Register standard systems.
var ANode = require('./core/a-node').ANode;
var AEntity = require('./core/a-entity').AEntity; // Depends on ANode and core components.

require('./core/a-assets');
require('./core/a-cubemap');
require('./core/a-mixin');

// Extras.
require('./extras/components/');
require('./extras/primitives/');

console.log('A-Frame Version: 1.5.0 (Date 2024-01-26, Commit #c5bab4cd)');
console.log('THREE Version (https://github.com/supermedium/three.js):',
            pkg.dependencies['super-three']);
console.log('WebVR Polyfill Version:', pkg.dependencies['webvr-polyfill']);

module.exports = window.AFRAME = {
  AComponent: require('./core/component').Component,
  AEntity: AEntity,
  ANode: ANode,
  ANIME: require('super-animejs').default,
  AScene: AScene,
  components: components,
  coreComponents: Object.keys(components),
  geometries: require('./core/geometry').geometries,
  registerComponent: registerComponent,
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
  utils: utils,
  version: pkg.version
};
