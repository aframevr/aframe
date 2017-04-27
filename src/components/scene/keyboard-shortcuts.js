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

    this.listener = window.addEventListener('keyup', function (event) {
      if (!shouldCaptureKeyEvent(event)) { return; }
      if (self.enterVREnabled && event.keyCode === 70) {  // f.
        scene.enterVR();
      }
      if (self.enterVREnabled && event.keyCode === 27) {  // escape.
        scene.exitVR();
      }
    }, false);
  },

  update: function (oldData) {
    var data = this.data;
    this.enterVREnabled = data.enterVR;
  },

  remove: function () {
    window.removeEventListener('keyup', this.listener);
  }
});
