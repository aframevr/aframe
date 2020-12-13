let registerComponent = require('../../core/component').registerComponent;
let shouldCaptureKeyEvent = require('../../utils/').shouldCaptureKeyEvent;

module.exports.Component = registerComponent('keyboard-shortcuts', {
  schema: {
    enterVR: {default: true},
    exitVR: {default: true}
  },

  init: function () {
    this.onKeyup = this.onKeyup.bind(this);
  },

  update: function (oldData) {
    let data = this.data;
    this.enterVREnabled = data.enterVR;
  },

  play: function () {
    window.addEventListener('keyup', this.onKeyup, false);
  },

  pause: function () {
    window.removeEventListener('keyup', this.onKeyup);
  },

  onKeyup: function (evt) {
    let scene = this.el;
    if (!shouldCaptureKeyEvent(evt)) { return; }
    if (this.enterVREnabled && evt.keyCode === 70) {  // f.
      scene.enterVR();
    }
    if (this.enterVREnabled && evt.keyCode === 27) {  // escape.
      scene.exitVR();
    }
  }
});
