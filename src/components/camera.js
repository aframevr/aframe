var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('camera', {
  defaults: {
    value: {
      fov: 45,
      near: 1,
      far: 10000
    }
  },

  init: {
    value: function () {
      this.setupCamera();
    }
  },

  update: {
    value: function () {
      var sceneEl = this.el.sceneEl;
      var data = this.data;
      var camera = this.camera;
      var aspect = window.innerWidth / window.innerHeight;
      // Setting three.js camera parameters
      camera.fov = data.fov;
      camera.near = data.near;
      camera.far = data.far;
      camera.aspect = data.aspect || aspect;
      camera.updateProjectionMatrix();
      sceneEl.cameraEl = this.el;
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
