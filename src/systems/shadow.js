var registerSystem = require('../core/system').registerSystem;
var bind = require('../utils/bind');
var THREE = require('../lib/three');

var SHADOW_MAP_TYPE_MAP = {
  basic: THREE.BasicShadowMap,
  pcf: THREE.PCFShadowMap,
  pcfsoft: THREE.PCFSoftShadowMap
};

/**
 * Shadow system.
 *
 * Enabled automatically when one or more shadow components are added to the scene, the system sets
 * options on the WebGLRenderer for configuring shadow appearance.
 */
module.exports.System = registerSystem('shadow', {
  schema: {
    type: {default: 'pcf', oneOf: ['basic', 'pcf', 'pcfsoft']},
    renderReverseSided: {default: true},
    renderSingleSided: {default: true}
  },

  init: function () {
    var sceneEl = this.sceneEl;
    var data = this.data;

    this.shadowMapEnabled = false;

    sceneEl.addEventListener('render-target-loaded', bind(function () {
      // Renderer is not initialized in most tests.
      if (!sceneEl.renderer) { return; }
      sceneEl.renderer.shadowMap.type = SHADOW_MAP_TYPE_MAP[data.type];
      sceneEl.renderer.shadowMap.renderReverseSided = data.renderReverseSided;
      sceneEl.renderer.shadowMap.renderSingleSided = data.renderSingleSided;
      this.setShadowMapEnabled(this.shadowMapEnabled);
    }, this));
  },

  /**
   * Enables/disables the renderer shadow map.
   * @param {boolean} enabled
   */
  setShadowMapEnabled: function (enabled) {
    var renderer = this.sceneEl.renderer;
    this.shadowMapEnabled = enabled;
    if (renderer) {
      renderer.shadowMap.enabled = enabled;
    }
  }
});
