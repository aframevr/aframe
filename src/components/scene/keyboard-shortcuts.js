var registerComponent = require('../../core/component').registerComponent;
var shouldCaptureKeyEvent = require('../../utils/').shouldCaptureKeyEvent;
var THREE = require('../../lib/three');

var controls = new THREE.VRControls(new THREE.Object3D());

module.exports.Component = registerComponent('keyboard-shortcuts', {
  schema: {
    enterVR: {default: true},
    exitVR: {default: true},
    resetSensor: {default: true}
  },

  init: function () {
    var self = this;
    var scene = this.el;

    this.listener = window.addEventListener('keyup', function (event) {
      if (!shouldCaptureKeyEvent(event)) { return; }
      if (self.enterVREnabled && event.keyCode === 70) {  // f.
        scene.enterVR();
      }
      if (self.enterVREnabled && event.keyCode === 27) {  // escape.
        scene.exitVR();
      }
      if (self.resetSensorEnabled && event.keyCode === 90) {  // z.
        controls.resetSensor();
      }
    }, false);
  },

  update: function (oldData) {
    var data = this.data;
    this.enterVREnabled = data.enterVR;
    this.resetSensorEnabled = data.resetSensor;
  },

  remove: function () {
    window.removeEventListener('keyup', this.listener);
  }
});
