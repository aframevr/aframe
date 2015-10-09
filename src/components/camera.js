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
      var data;
      var camera = this.camera;
      defaults.aspect = window.innerWidth / window.innerHeight;
      data = this.applyDefaults(defaults);
      // Setting three.js camera parameters
      camera.fov = data.fov;
      camera.near = data.near;
      camera.far = data.far;
      camera.aspect = data.aspect;
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
