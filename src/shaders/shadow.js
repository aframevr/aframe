var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');

/**
 * Flat shader using THREE.ShadowMaterial.
 */
module.exports.Shader = registerShader('shadow', {
  schema: {
    opacity: {default: 0.5},
    transparent: {default: true},
    alphaToCoverage: {default: true}
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.material = new THREE.ShadowMaterial();
  },

  update: function (data) {
    this.material.opacity = data.opacity;
    this.material.alphaToCoverage = data.alphaToCoverage;
    this.material.transparent = data.transparent;
  }
});
