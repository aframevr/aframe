var registerComponent = require('../core/component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('camera', {
  schema: {
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
    el.object3D.add(camera);
    el.sceneEl.cameraEl = el;
  },

  /**
   * Updates three.js camera.
   */
  update: function () {
    var data = this.data;
    var camera = this.camera;
    camera.aspect = data.aspect || (window.innerWidth / window.innerHeight);
    camera.far = data.far;
    camera.fov = data.fov;
    camera.near = data.near;
    camera.updateProjectionMatrix();
  }
});
