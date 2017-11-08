var registerSystem = require('../core/system').registerSystem;
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
    autoUpdate: {default: true},
    renderReverseSided: {default: true},
    renderSingleSided: {default: true},
    type: {default: 'pcf', oneOf: ['basic', 'pcf', 'pcfsoft']}
  },

  init: function () {
    var sceneEl = this.sceneEl;
    var data = this.data;

    this.shadowMapEnabled = false;

    if (!sceneEl.renderer) { return; }  // For tests.

    sceneEl.renderer.shadowMap.type = SHADOW_MAP_TYPE_MAP[data.type];
    sceneEl.renderer.shadowMap.renderReverseSided = data.renderReverseSided;
    sceneEl.renderer.shadowMap.renderSingleSided = data.renderSingleSided;
    sceneEl.renderer.shadowMap.autoUpdate = data.autoUpdate;
    this.setShadowMapEnabled(this.shadowMapEnabled);
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
