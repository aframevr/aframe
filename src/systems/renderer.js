import * as THREE from 'three';
import { registerSystem } from '../core/system.js';
import * as utils from '../utils/index.js';

var debug = utils.debug;
var warn = debug('components:renderer:warn');

/**
 * Determines state of various renderer properties.
 */
export var System = registerSystem('renderer', {
  schema: {
    antialias: {default: 'auto', oneOf: ['true', 'false', 'auto']},
    highRefreshRate: {default: utils.device.isOculusBrowser()},
    logarithmicDepthBuffer: {default: 'auto', oneOf: ['true', 'false', 'auto']},
    maxCanvasWidth: {default: -1},
    maxCanvasHeight: {default: -1},
    multiviewStereo: {default: false},
    exposure: {default: 1, if: {toneMapping: ['ACESFilmic', 'linear', 'reinhard', 'cineon', 'AgX', 'neutral']}},
    toneMapping: {default: 'no', oneOf: ['no', 'ACESFilmic', 'linear', 'reinhard', 'cineon', 'AgX', 'neutral']},
    precision: {default: 'high', oneOf: ['high', 'medium', 'low']},
    anisotropy: {default: 1},
    sortTransparentObjects: {default: false},
    colorManagement: {default: true},
    alpha: {default: true},
    stencil: {default: false},
    foveationLevel: {default: 1}
  },

  init: function () {
    var data = this.data;
    var sceneEl = this.el;
    var toneMappingName = this.data.toneMapping.charAt(0).toUpperCase() + this.data.toneMapping.slice(1);
    // This is the rendering engine, such as THREE.js so copy over any persistent properties from the rendering system.
    var renderer = sceneEl.renderer;

    renderer.toneMapping = THREE[toneMappingName + 'ToneMapping'];
    THREE.Texture.DEFAULT_ANISOTROPY = data.anisotropy;

    THREE.ColorManagement.enabled = data.colorManagement;
    renderer.outputColorSpace = data.colorManagement ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;

    if (sceneEl.hasAttribute('antialias')) {
      warn('Component `antialias` is deprecated. Use `renderer="antialias: true"` instead.');
    }

    if (sceneEl.hasAttribute('logarithmicDepthBuffer')) {
      warn('Component `logarithmicDepthBuffer` is deprecated. Use `renderer="logarithmicDepthBuffer: true"` instead.');
    }

    // These properties are always the same, regardless of rendered configuration
    renderer.sortObjects = true;
    renderer.setOpaqueSort(sortFrontToBack);
  },

  update: function () {
    var data = this.data;
    var sceneEl = this.el;
    var renderer = sceneEl.renderer;
    var toneMappingName = this.data.toneMapping.charAt(0).toUpperCase() + this.data.toneMapping.slice(1);
    renderer.toneMapping = THREE[toneMappingName + 'ToneMapping'];
    renderer.toneMappingExposure = data.exposure;
    renderer.xr.setFoveation(data.foveationLevel);

    if (data.sortObjects) {
      warn('`sortObjects` property is deprecated. Use `renderer="sortTransparentObjects: true"` instead.');
    }
    if (data.sortTransparentObjects) {
      renderer.setTransparentSort(sortBackToFront);
    } else {
      renderer.setTransparentSort(sortRenderOrderOnly);
    }
  },

  applyColorCorrection: function (texture) {
    if (!this.data.colorManagement || !texture) {
      return;
    }

    if (texture.isTexture && texture.colorSpace !== THREE.SRGBColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  },

  setWebXRFrameRate: function (xrSession) {
    var data = this.data;
    var rates = xrSession.supportedFrameRates;
    if (rates && xrSession.updateTargetFrameRate) {
      var targetRate;
      if (rates.includes(90)) {
        targetRate = data.highRefreshRate ? 90 : 72;
      } else {
        targetRate = data.highRefreshRate ? 72 : 60;
      }
      xrSession.updateTargetFrameRate(targetRate).catch(function (error) {
        console.warn('failed to set target frame rate of ' + targetRate + '. Error info: ' + error);
      });
    }
  }
});

// Custom A-Frame sort functions.
// Variations of Three.js default sort orders here:
// https://github.com/mrdoob/three.js/blob/ebbaecf9acacf259ea9abdcba7b6fb25cfcea2ab/src/renderers/webgl/WebGLRenderLists.js#L1
// See: https://github.com/aframevr/aframe/issues/5332

// Default sort for opaque objects:
// - respect groupOrder & renderOrder settings
// - sort front-to-back by z-depth from camera (this should minimize overdraw)
// - otherwise leave objects in default order (object tree order)

export function sortFrontToBack (a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  }
  if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  }
  return a.z - b.z;
}

// Default sort for transparent objects:
// - respect groupOrder & renderOrder settings
// - otherwise leave objects in default order (object tree order)
export function sortRenderOrderOnly (a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  }
  return a.renderOrder - b.renderOrder;
}

// Spatial sort for transparent objects:
// - respect groupOrder & renderOrder settings
// - sort back-to-front by z-depth from camera
// - otherwise leave objects in default order (object tree order)
export function sortBackToFront (a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  }
  if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  }
  return b.z - a.z;
}
