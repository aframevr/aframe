var registerComponent = require('../core/register-component');
var THREE = require('../../lib/three');

var defaults = {
  fov: 45,
  near: 1,
  far: 10000
};

module.exports.Component = registerComponent('camera', {
  init: {
    value: function () {
      this.setupCamera();
    }
  },

  update: {
    value: function () {
      var data = this.data;
      var camera = this.camera;
      // Setting three.js camera parameters
      camera.fov = data.fov || defaults.fov;
      camera.near = data.near || defaults.near;
      camera.far = data.far || defaults.far;
      camera.aspect = data.aspect || window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  },

  setupCamera: {
    value: function () {
      var el = this.el;
      var camera = this.camera = new THREE.PerspectiveCamera();
      el.object3D.add(camera);
    }
  }
});
