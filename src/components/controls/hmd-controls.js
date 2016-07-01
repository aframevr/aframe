var registerControls = require('../../core/controls').registerControls;
var THREE = require('../../lib/three');
var isMobile = require('../../utils/').isMobile();

var radToDeg = THREE.Math.radToDeg;

/**
 * HMD-controls component.
 *
 * Updates rotation based on HMD orientation.
 */
module.exports.Component = registerControls('hmd-controls', {
  schema: {
    enabled: {default: true},
    standing: {default: true}
  },

  init: function () {
    this.isPositionCalibrated = false;
    this.dolly = new THREE.Object3D();
    this.hmdEuler = new THREE.Euler();
    this.previousHMDPosition = new THREE.Vector3();
    this.deltaHMDPosition = new THREE.Vector3();
    this.vrControls = new THREE.VRControls(this.dolly);
    this.rotation = new THREE.Vector3();
  },

  update: function () {
    var data = this.data;
    var vrControls = this.vrControls;
    vrControls.standing = data.standing;
    vrControls.update();
  },

  tick: function (t, dt) {
    this.vrControls.update();
  },

  remove: function () {
    this.vrControls.dispose();
  },

  isRotationActive: function () {
    var hmdEuler = this.hmdEuler;
    if (!this.data.enabled || !(this.el.sceneEl.is('vr-mode') || isMobile)) {
      return false;
    }
    hmdEuler.setFromQuaternion(this.dolly.quaternion, 'YXZ');
    return !isNullVector(hmdEuler);
  },

  getRotation: function () {
    var hmdEuler = this.hmdEuler;
    return this.rotation.set(
      radToDeg(hmdEuler.x),
      radToDeg(hmdEuler.y),
      radToDeg(hmdEuler.z)
    );
  },

  isVelocityActive: function () {
    var deltaHMDPosition = this.deltaHMDPosition;
    var previousHMDPosition = this.previousHMDPosition;
    var currentHMDPosition = this.calculateHMDPosition();
    this.isPositionCalibrated = this.isPositionCalibrated || !isNullVector(previousHMDPosition);
    if (!this.data.enabled || !this.el.sceneEl.is('vr-mode') || isMobile) {
      return false;
    }
    deltaHMDPosition.copy(currentHMDPosition).sub(previousHMDPosition);
    previousHMDPosition.copy(currentHMDPosition);
    return this.isPositionCalibrated && !isNullVector(deltaHMDPosition);
  },

  getPositionDelta: function () {
    return this.deltaHMDPosition;
  },

  calculateHMDPosition: function () {
    var dolly = this.dolly;
    var position = new THREE.Vector3();
    dolly.updateMatrix();
    position.setFromMatrixPosition(dolly.matrix);
    return position;
  }
});

function isNullVector (vector) {
  return vector.x === 0 && vector.y === 0 && vector.z === 0;
}
