var registerSystem = require('../core/system').registerSystem;
var utils = require('../utils/');
var THREE = require('../lib/three');

var debug = utils.debug;
var warn = debug('components:renderer:warn');

/**
 * Determines state of various renderer properties.
 */
module.exports.System = registerSystem('renderer', {
  schema: {
    antialias: {default: 'auto', oneOf: ['true', 'false', 'auto']},
    highRefreshRate: {default: utils.device.isOculusBrowser()},
    logarithmicDepthBuffer: {default: 'auto', oneOf: ['true', 'false', 'auto']},
    maxCanvasWidth: {default: 1920},
    maxCanvasHeight: {default: 1920},
    physicallyCorrectLights: {default: false},
    precision: {default: 'high', oneOf: ['high', 'medium', 'low']},
    sortObjects: {default: false},
    colorManagement: {default: false},
    gammaOutput: {default: false},
    alpha: {default: true},
    foveationLevel: {default: 0}
  },

  init: function () {
    var data = this.data;
    var sceneEl = this.el;
    // This is the rendering engine, such as THREE.js so copy over any persistent properties from the rendering system.
    var renderer = sceneEl.renderer;
    renderer.sortObjects = data.sortObjects;
    renderer.physicallyCorrectLights = data.physicallyCorrectLights;

    if (data.colorManagement || data.gammaOutput) {
      renderer.outputEncoding = THREE.sRGBEncoding;
      if (data.gammaOutput) {
        warn('Property `gammaOutput` is deprecated. Use `renderer="colorManagement: true;"` instead.');
      }
    }

    if (sceneEl.hasAttribute('antialias')) {
      warn('Component `antialias` is deprecated. Use `renderer="antialias: true"` instead.');
    }

    if (sceneEl.hasAttribute('logarithmicDepthBuffer')) {
      warn('Component `logarithmicDepthBuffer` is deprecated. Use `renderer="logarithmicDepthBuffer: true"` instead.');
    }
  },

  applyColorCorrection: function (colorOrTexture) {
    if (!this.data.colorManagement || !colorOrTexture) {
      return;
    } else if (colorOrTexture.isColor) {
      colorOrTexture.convertSRGBToLinear();
    } else if (colorOrTexture.isTexture) {
      colorOrTexture.encoding = THREE.sRGBEncoding;
    }
  }
});
