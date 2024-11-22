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
if (!window.cordova && window.location.protocol === 'file:') {
  error(
    'This HTML file is currently being served via the file:// protocol. ' +
    'Assets, textures, and models WILL NOT WORK due to cross-origin policy! ' +
    'Please use a local or hosted server: ' +
    'https://aframe.io/docs/1.4.0/introduction/installation.html#use-a-local-server.');
}

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
var readyState = require('./core/readyState');

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

console.log('A-Frame Version: 1.6.0 (Date 2024-11-22, Commit #3eadfd3a)');
console.log('THREE Version (https://github.com/supermedium/three.js):',
            THREE.REVISION);

// Wait for ready state, unless user asynchronously initializes A-Frame.
if (!window.AFRAME_ASYNC) {
  readyState.waitForDocumentReadyState();
}

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
  emitReady: readyState.emitReady,
  THREE: THREE,
  utils: utils,
  version: pkg.version
};
