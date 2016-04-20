var registerControls = require('../../core/controls').registerControls;
var THREE = require('../../lib/three');

/**
 * HMD-controls component.
 *
 * Updates rotation based on HMD orientation.
 */
module.exports.Component = registerControls('hmd-controls', {
  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.dolly = new THREE.Object3D();
    this.hmdEuler = new THREE.Euler();
    this.hmdEuler.order = 'YXZ';
    this.hmdQuaternion = new THREE.Quaternion();
    this.controls = new THREE.VRControls(this.dolly);
    this.zeroQuaternion = new THREE.Quaternion();
    this.rotation = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.position = new THREE.Vector3();
  },

  tick: function (t, dt) {
    this.controls.update();
  },

  remove: function () {
    this.controls.dispose();
  },

  isRotationActive: function () {
    return this.data.enabled && !this.dolly.quaternion.equals(this.zeroQuaternion);
  },

  getRotation: function () {
    this.calculateHMDEuler();
    this.rotation.set(
      THREE.Math.radToDeg(this.hmdEuler.x),
      THREE.Math.radToDeg(this.hmdEuler.y),
      THREE.Math.radToDeg(this.hmdEuler.z)
    );
    return this.rotation;
  },

  calculateHMDEuler: function () {
    var dolly = this.dolly;
    if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
      this.zeroOrientation();
      this.zeroed = true;
    }
    this.hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
    this.hmdEuler.setFromQuaternion(this.hmdQuaternion);
  },

  zeroOrientation: function () {
    var euler = new THREE.Euler();
    euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
    // Cancel out roll and pitch. We want to only reset yaw.
    euler.z = 0;
    euler.x = 0;
    this.zeroQuaternion.setFromEuler(euler);
  },

  isVelocityActive: function () {
    return this.data.enabled && !this.position.equals(this.dolly.position);
  },

  getVelocity: function () {
    var dolly = this.dolly;
    this.velocity.copy(dolly.position).sub(this.position);
    this.position.copy(dolly.position);
    return this.velocity;
  }
});
