var registerSystem = require('../core/system').registerSystem;
var utils = require('../utils/');

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
    workflow: {default: 'gamma', oneOf: ['linear', 'gamma']},
    gammaOutput: {default: false}
  },

  init: function () {
    var data = this.data;
    var sceneEl = this.el;
    var renderer = sceneEl.renderer;

    renderer.sortObjects = data.sortObjects;
    renderer.physicallyCorrectLights = data.physicallyCorrectLights;

    if (data.workflow === 'linear' || data.gammaOutput) {
      renderer.gammaOutput = true;
      renderer.gammaFactor = 2.2;
      if (data.gammaOutput) {
        warn('Property `gammaOutput` is deprecated. Use `renderer="workflow: linear;"` instead.');
      }
    }

    // TODO: Uncomment these lines and deprecate 'antialias' for v0.9.0.
    // if (el.hasAttribute('antialias')) {
    //   warn('Component `antialias` is deprecated. Use `renderer="antialias: true"` instead.');
    // }
  }
});
