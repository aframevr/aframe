var registerSystem = require('../core/system').registerSystem;
var THREE = require('../lib/three');

var camera = null;
var scene = null;

/**
 * Animation system.
 *
 * Controls library-level animation events agnostic to implementations.
 *
 */
module.exports.System = registerSystem('gltf-model', {
  init: function () {
    this.sceneEl.addEventListener('camera-ready', function () {
      scene = this.sceneEl.object3D;
      camera = this.sceneEl.camera;
    }, true);
  },

  /**
   * Update animation mixers and shaders.
   *
   */
  tick: function () {
    if (scene && camera) {
      THREE.glTFAnimator.update();
      THREE.glTFShaders.update(scene, camera);
    }
  }
});
