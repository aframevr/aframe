import * as THREE from 'three';
import { registerSystem } from '../core/system.js';

var SHADOW_MAP_TYPE_MAP = {
  basic: THREE.BasicShadowMap,
  pcf: THREE.PCFShadowMap
};

/**
 * Shadow system.
 *
 * Enabled automatically when one or more shadow components are added to the scene, the system sets
 * options on the WebGLRenderer for configuring shadow appearance.
 */
export var System = registerSystem('shadow', {
  schema: {
    enabled: {default: true},
    autoUpdate: {default: true},
    type: {default: 'pcf', oneOf: ['basic', 'pcf']}
  },

  init: function () {
    var sceneEl = this.sceneEl;
    var data = this.data;
    var type = data.type;

    this.shadowMapEnabled = false;

    if (SHADOW_MAP_TYPE_MAP[type] === undefined) {
      console.warn('shadow type "' + type + '" is not supported, falling back to "pcf". To remove this warning set <a-scene shadow="type: pcf">.');
      type = 'pcf';
    }

    sceneEl.renderer.shadowMap.type = SHADOW_MAP_TYPE_MAP[type];
    sceneEl.renderer.shadowMap.autoUpdate = data.autoUpdate;
  },

  update: function (prevData) {
    if (prevData.enabled !== this.data.enabled) {
      this.setShadowMapEnabled(this.shadowMapEnabled);
    }
  },

  /**
   * Enables/disables the renderer shadow map.
   * @param {boolean} enabled
   */
  setShadowMapEnabled: function (enabled) {
    var sceneEl = this.sceneEl;
    var renderer = this.sceneEl.renderer;

    this.shadowMapEnabled = enabled;
    var newEnabledState = this.data.enabled && this.shadowMapEnabled;
    if (renderer && newEnabledState !== renderer.shadowMap.enabled) {
      renderer.shadowMap.enabled = newEnabledState;

      // Materials must be updated for the change to take effect.
      updateAllMaterials(sceneEl);
    }
  }
});

function updateAllMaterials (sceneEl) {
  if (!sceneEl.hasLoaded) { return; }

  sceneEl.object3D.traverse(function (node) {
    if (node.material) {
      var materials = Array.isArray(node.material) ? node.material : [node.material];
      for (var i = 0; i < materials.length; i++) {
        materials[i].needsUpdate = true;
      }
    }
  });
}
