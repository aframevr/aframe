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
    logarithmicDepthBuffer: {default: 'auto', oneOf: ['true', 'false', 'auto']},
    maxCanvasWidth: {default: 1920},
    maxCanvasHeight: {default: 1920},
    physicallyCorrectLights: {default: false},
    sortObjects: {default: false},
    colorManagement: {default: false},
    gammaOutput: {default: false}
  },

  init: function () {
    var data = this.data;
    var sceneEl = this.el;
    var renderer = sceneEl.renderer;

    renderer.sortObjects = data.sortObjects;
    renderer.physicallyCorrectLights = data.physicallyCorrectLights;

    if (data.colorManagement || data.gammaOutput) {
      renderer.gammaOutput = true;
      renderer.gammaFactor = 2.2;
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
