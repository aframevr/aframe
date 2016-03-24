var registerComponent = require('../../core/component').registerComponent;
var THREE = require('../../lib/three');

var TICK_DEBOUNCE = 4; // ms

/**
 * HMD-controls component.
 *
 * Updates rotation based on HMD orientation.
 */
module.exports.Component = registerComponent('hmd-controls', {
  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.tPrev = Date.now();
    this.dolly = new THREE.Object3D();
    this.euler = new THREE.Euler();
    this.controls = new THREE.VRControls(this.dolly);
    this.zeroQuaternion = new THREE.Quaternion();
  },

  tick: function (t, dt) {
    t = t || Date.now();
    if (t - this.tPrev > TICK_DEBOUNCE) {
      this.controls.update();
      this.tPrev = t;
    }
  },

  remove: function () {
    this.controls.dispose();
  },

  isRotationActive: function () {
    return this.data.enabled && !this.dolly.quaternion.equals(this.zeroQuaternion);
  },

  getRotation: (function () {
    var hmdEuler = new THREE.Euler();
    hmdEuler.order = 'YXZ';
    return function () {
      // Ensure tick has been applied before returning orientation.
      this.tick();
      var hmdQuaternion = this.calculateHMDQuaternion();
      hmdEuler.setFromQuaternion(hmdQuaternion);
      return new THREE.Vector3(
        THREE.Math.radToDeg(hmdEuler.x),
        THREE.Math.radToDeg(hmdEuler.y),
        THREE.Math.radToDeg(hmdEuler.z)
      );
    };
  }()),

  calculateHMDQuaternion: (function () {
    var hmdQuaternion = new THREE.Quaternion();
    return function () {
      var dolly = this.dolly;
      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
        this.zeroOrientation();
        this.zeroed = true;
      }
      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
      return hmdQuaternion;
    };
  }()),

  zeroOrientation: function () {
    var euler = new THREE.Euler();
    euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
    // Cancel out roll and pitch. We want to only reset yaw.
    euler.z = 0;
    euler.x = 0;
    this.zeroQuaternion.setFromEuler(euler);
  }
});
