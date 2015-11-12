var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('hmd-controls', {
  defaults: {
    value: {
      enabled: true
    }
  },

  init: {
    value: function () {
      this.setupControls();
    }
  },

  setupControls: {
    value: function () {
      var scene = this.el.sceneEl;
      var dolly = this.dolly = new THREE.Object3D();
      this.zeroQuaternion = new THREE.Quaternion();
      this.euler = new THREE.Euler();
      this.controls = new THREE.VRControls(dolly);
      scene.addBehavior(this);
    }
  },

  update: {
    value: (function () {
      var headQuaternion = new THREE.Quaternion();
      return function () {
        var dolly = this.dolly;
        var euler = this.euler;
        var zeroQuaternion = this.zeroQuaternion;
        if (!this.data.enabled) { return; }
        this.controls.update();
        if (!this.zeroed && !this.dolly.quaternion.equals(zeroQuaternion)) {
          this.zeroOrientation();
          this.zeroed = true;
        }
        // Updates head quaternion
        headQuaternion.copy(zeroQuaternion).multiply(dolly.quaternion);
        euler.setFromQuaternion(headQuaternion);
        this.el.setAttribute('position', dolly.position);
        this.el.setAttribute('rotation', {
          x: THREE.Math.radToDeg(euler.x),
          y: THREE.Math.radToDeg(euler.y),
          z: THREE.Math.radToDeg(euler.z)
        });
      };
    })()
  },

  zeroOrientation: {
    value: function () {
      var euler = this.euler;
      euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
      // Cancel out roll and pitch. We want to only reset yaw
      euler.z = 0;
      euler.x = 0;
      this.zeroQuaternion.setFromEuler(euler);
    }
  }
});
