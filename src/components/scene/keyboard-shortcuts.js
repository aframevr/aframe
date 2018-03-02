var registerComponent = require('../../core/component').registerComponent;
var shouldCaptureKeyEvent = require('../../utils/').shouldCaptureKeyEvent;

module.exports.Component = registerComponent('keyboard-shortcuts', {
  schema: {
    enterVR: {default: true},
    exitVR: {default: true}
  },

  init: function () {
    var self = this;
    var scene = this.el;

    this.listener = function (event) {
      if (!shouldCaptureKeyEvent(event)) { return; }
      if (self.enterVREnabled && event.keyCode === 70) {  // f.
        scene.enterVR();
      }
      if (self.enterVREnabled && event.keyCode === 27) {  // escape.
        scene.exitVR();
      }
    };
  },

  update: function (oldData) {
    var data = this.data;
    this.enterVREnabled = data.enterVR;
  },

  play: function () {
    window.addEventListener('keyup', this.listener, false);
  },

  pause: function () {
    window.removeEventListener('keyup', this.listener);
  }
});
