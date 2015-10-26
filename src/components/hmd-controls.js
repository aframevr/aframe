var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('hmd-controls', {
  init: {
    value: function () {
      this.setupControls();
    }
  },

  setupControls: {
    value: function () {
      var scene = this.el.sceneEl;
      var dolly = this.dolly = new THREE.Object3D();
      this.euler = new THREE.Euler();
      this.controls = new THREE.VRControls(dolly);
      scene.addBehavior(this);
    }
  },

  update: {
    value: function () {
      var dolly = this.dolly;
      var quaternion;
      var euler = this.euler;
      var rotation;
      this.controls.update();
      quaternion = dolly.quaternion;
      euler.setFromQuaternion(quaternion);
      rotation = euler.toArray();
      rotation = {
        x: THREE.Math.radToDeg(rotation[0]),
        y: THREE.Math.radToDeg(rotation[1]),
        z: THREE.Math.radToDeg(rotation[2])
      };
      this.el.setAttribute('position', dolly.position);
      this.el.setAttribute('rotation', rotation);
    }
  }
});
