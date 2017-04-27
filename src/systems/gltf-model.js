var registerSystem = require('../core/system').registerSystem;
var THREE = require('../lib/three');

/**
 * glTF model system.
 */
module.exports.System = registerSystem('gltf-model', {
  init: function () {
    this.models = [];
  },

  /**
   * Updates shaders for all glTF models in the system.
   */
  tick: function () {
    var sceneEl = this.sceneEl;
    if (sceneEl.hasLoaded && this.models.length) {
      THREE.GLTFLoader.Shaders.update(sceneEl.object3D, sceneEl.camera);
    }
  },

  /**
   * Registers a glTF asset.
   * @param {object} gltf Asset containing a scene and (optional) animations and cameras.
   */
  registerModel: function (gltf) {
    this.models.push(gltf);
  },

  /**
   * Unregisters a glTF asset.
   * @param  {object} gltf Asset containing a scene and (optional) animations and cameras.
   */
  unregisterModel: function (gltf) {
    var models = this.models;
    var index = models.indexOf(gltf);
    if (index >= 0) {
      models.splice(index, 1);
    }
  }
});
