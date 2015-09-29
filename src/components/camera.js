var registerComponent = require('./register-component');
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('camera', {
  update: {
    value: function () {
      var el = this.el;
      var camera = el.object3D = this.camera = this.camera || this.setupCamera();
      // Setting three.js camera parameters
      camera.fov = this.fov || 45;
      camera.near = this.near || 1;
      camera.far = this.far || 10000;
      camera.aspect = this.aspect || window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  },

  setupCamera: {
    value: function () {
      var camera = new THREE.PerspectiveCamera();
      this.camera = this.objectcamera;
      return camera;
    }
  }
});
