var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

module.exports.Component = registerComponent('camera', {
  schema: {
    active: { default: true },
    far: { default: 10000 },
    fov: { default: 80, min: 0 },
    near: { default: 0.5, min: 0 }
  },

  /**
   * Initializes three.js camera, adding it to the entity.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function () {
    var camera = this.camera = new THREE.PerspectiveCamera();
    var el = this.el;
    el.setObject3D('camera', camera);
  },

  /**
   * Remove camera on remove (callback).
   */
  remove: function () {
    this.el.removeObject3D('camera');
  },

  /**
   * Updates three.js camera.
   */
  update: function (oldData) {
    var el = this.el;
    var sceneEl = el.sceneEl;
    var data = this.data;
    var camera = this.camera;
    camera.aspect = data.aspect || (window.innerWidth / window.innerHeight);
    camera.far = data.far;
    camera.fov = data.fov;
    camera.near = data.near;
    camera.updateProjectionMatrix();
    // If the active property has changes or on first update call
    if (!oldData || oldData.active !== data.active) {
      if (data.active) {
        sceneEl.setActiveCamera(camera);
        sceneEl.emit('camera-set-active', { camera: camera });
      } else if (sceneEl.camera === camera) {
        // If the camera is disabled and is the current active one
        sceneEl.setActiveCamera();
      }
    }
  }
});
