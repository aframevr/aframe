var register = require('../../core/component').registerComponent;
var debug = require('../../utils/debug');

var warn = debug('components:renderer:warn');

/**
 * Determines state of various renderer properties.
 *
 * NOTE: Because the `renderer` component is not added to the scene
 * automatically, changing default values here has no effect unless
 * the same changes are included in `a-scene.js`.
 */
module.exports.Component = register('renderer', {
  schema: {
    antialias: {default: 'auto', oneOf: ['true', 'false', 'auto']},
    gammaOutput: {default: false},
    physicallyCorrectLights: {default: false},
    sortObjects: {default: false}
  },

  init: function () {
    var el = this.el;

    if (!el.isScene) {
      warn('Renderer component can only be applied to <a-scene>');
    }

    // TODO: Uncomment these lines and deprecate 'antialias' for v0.9.0.
    // if (el.hasAttribute('antialias')) {
    //   warn('Component `antialias` is deprecated. Use `renderer="antialias: true"` instead.');
    // }
  },

  update: function (prevData) {
    var data = this.data;
    var sceneEl = this.el;
    var renderer = sceneEl.renderer;
    var needsShaderUpdate = false;

    if (sceneEl.time > 0 && data.antialias !== prevData.antialias) {
      warn('Property "antialias" cannot be changed after scene initialization');
    }

    if (data.sortObjects !== prevData.sortObjects) {
      renderer.sortObjects = data.sortObjects;
    }

    if (data.gammaOutput !== prevData.gammaOutput) {
      renderer.gammaOutput = data.gammaOutput;
      needsShaderUpdate = true;
    }

    if (data.physicallyCorrectLights !== prevData.physicallyCorrectLights) {
      renderer.physicallyCorrectLights = data.physicallyCorrectLights;
      needsShaderUpdate = true;
    }

    if (!needsShaderUpdate || sceneEl.time === 0) { return; }

    warn('Modifying renderer properties at runtime requires shader update and may drop frames.');

    sceneEl.object3D.traverse(function (node) {
      if (!node.isMesh) { return; }
      if (Array.isArray(node.material)) {
        node.material.forEach(function (material) {
          material.needsUpdate = true;
        });
      } else {
        node.material.needsUpdate = true;
      }
    });
  }
});
