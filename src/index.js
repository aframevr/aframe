import ANIME from 'super-animejs';
import THREE from './lib/three.js';

import { AScene } from './core/scene/a-scene.js';
import scenes from './core/scene/scenes.js';
import { ANode } from './core/a-node.js';
import { AEntity } from './core/a-entity.js'; // Depends on ANode and core components.
import { registerComponent, components, Component } from './core/component.js';
import { registerGeometry, geometries } from './core/geometry.js';
import { registerPrimitive, primitives } from './extras/primitives/primitives.js';
import { registerShader, shaders } from './core/shader.js';
import { registerSystem, systems } from './core/system.js';
import * as schema from './core/schema.js';
import * as readyState from './core/readyState.js';

import './core/a-assets.js';
import './core/a-cubemap.js';
import './core/a-mixin.js';

import * as utils from './utils/index.js';
import pkg from '../package.json';

import './components/index.js'; // Register standard components.
import './geometries/index.js'; // Register standard geometries.
import './shaders/index.js'; // Register standard shaders.
import './systems/index.js'; // Register standard systems.

// Depends on material component and standard shader
import getMeshMixin from './extras/primitives/getMeshMixin.js';

// Extras.
import './extras/components/index.js';
import './extras/primitives/index.js';

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
  window.logs = debug;
  require('./style/aframe.css');
  require('./style/rStats.css');
}

console.log('A-Frame Version: 1.7.0 (Date 2025-02-20, Commit #ad5cef10)');
console.log('THREE Version (https://github.com/supermedium/three.js):',
            THREE.REVISION);

// Wait for ready state, unless user asynchronously initializes A-Frame.
if (!window.AFRAME_ASYNC) {
  readyState.waitForDocumentReadyState();
}

var AFRAME = globalThis.AFRAME = {
  AComponent: Component,
  AEntity: AEntity,
  ANode: ANode,
  ANIME: ANIME,
  AScene: AScene,
  components: components,
  coreComponents: Object.keys(components),
  geometries: geometries,
  registerComponent: registerComponent,
  registerGeometry: registerGeometry,
  registerPrimitive: registerPrimitive,
  registerShader: registerShader,
  registerSystem: registerSystem,
  primitives: {
    getMeshMixin: getMeshMixin,
    primitives: primitives
  },
  scenes: scenes,
  schema: schema,
  shaders: shaders,
  systems: systems,
  emitReady: readyState.emitReady,
  THREE: THREE,
  utils: utils,
  version: pkg.version
};
export default AFRAME;
