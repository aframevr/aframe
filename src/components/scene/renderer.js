/* global HTMLElement */
var register = require('../../core/component').registerComponent;
var debug = require('../../utils/debug');

var warn = debug('components:renderer:warn');

/**
 * Determines state of various renderer properties.
 * This could be done by a component, but it's important
 * to know the values when the renderer is created, so
 * that materials don't need to be recompiled.
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
    var data = this.data;
    var renderer = el.renderer;

    if (!el.isScene) {
      warn('Fog component can only be applied to <a-scene>');
    }

    // Default not AA for mobile.
    // NOTE: This default is also applied in a-scene.js.
    var attrString = HTMLElement.prototype.getAttribute.call(el, this.name);
    if (attrString && !attrString.match(/($|\W)antialias\W/)) {
      el.setAttribute(this.name, {antialias: !el.isMobile});
    }

    renderer.gammaOutput = data.gammaOutput;
    renderer.sortObjects = data.sortObjects;
    renderer.physicallyCorrectLights = data.physicallyCorrectLights;
  },
  update: function (prevData) {
    if (!Object.keys(prevData).length) { return; }

    var data = this.data;
    var sceneEl = this.el;
    var renderer = sceneEl.renderer;
    var needsShaderUpdate = false;

    if (data.antialias !== prevData.antialias) {
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

    if (needsShaderUpdate) {
      warn('Modifying renderer properties at runtime requires shader update and may drop frames.');
      sceneEl.object3D.traverse(function (node) {
        if (node.isMesh) {
          if (Array.isArray(node.material)) {
            node.material.forEach(function (material) {
              material.needsUpdate = true;
            });
          } else {
            node.material.needsUpdate = true;
          }
        }
      });
    }
  }
});
