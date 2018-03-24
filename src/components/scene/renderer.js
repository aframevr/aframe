var register = require('../../core/component').registerComponent;
var debug = require('../../utils/debug');

var warn = debug('components:renderer:warn');

/**
 * Determines state of various renderer properties.
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

    if (el.hasAttribute('antialias')) {
      warn('Component `antialias` is deprecated. Use `renderer="antialias: true"` instead.');
    }

    // NOTE: `renderer.antialias` is applied in a-scene.js, as it's too late
    // to change it when this component initializes.

    this.updateRenderer();
  },
  update: function (prevData) {
    if (!Object.keys(prevData).length) { return; }

    var sceneEl = this.el;
    var needsShaderUpdate = this.updateRenderer(prevData);

    if (!needsShaderUpdate) { return; }

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
  },
  updateRenderer: function (prevData) {
    var data = this.data;
    var sceneEl = this.el;
    var renderer = sceneEl.renderer;
    var needsShaderUpdate = false;

    if (prevData && data.antialias !== prevData.antialias) {
      warn('Property "antialias" cannot be changed after scene initialization');
    }

    if (!prevData || data.sortObjects !== prevData.sortObjects) {
      renderer.sortObjects = data.sortObjects;
    }

    if (!prevData || data.gammaOutput !== prevData.gammaOutput) {
      renderer.gammaOutput = data.gammaOutput;
      needsShaderUpdate = true;
    }

    if (!prevData || data.physicallyCorrectLights !== prevData.physicallyCorrectLights) {
      renderer.physicallyCorrectLights = data.physicallyCorrectLights;
      needsShaderUpdate = true;
    }

    return needsShaderUpdate;
  }
});
