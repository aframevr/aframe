var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');

/**
 * AR shadow shader using THREE.ShadowMaterial.
 */
module.exports.Shader = registerShader('shadow', {
  schema: {
    color: {type: 'color', default: 0x0},
    opacity: {default: 0.4, min: 0.0, max: 1.0}
  },

  init: function (data) {
    this.rendererSystem = this.el.sceneEl.systems.renderer;
    this.material = new THREE.ShadowMaterial();
  },

  update: function (data) {
    this.material.opacity = data.opacity;
    this.material.color.set(data.color);
    this.rendererSystem.applyColorCorrection(this.material.color);
  }
});
