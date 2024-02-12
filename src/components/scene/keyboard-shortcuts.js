import { registerComponent } from '../../core/component.js';
import { shouldCaptureKeyEvent } from '../../utils/index.js';

export var Component = registerComponent('keyboard-shortcuts', {
  schema: {
    enterVR: {default: true},
    exitVR: {default: true}
  },

  sceneOnly: true,

  init: function () {
    this.onKeyup = this.onKeyup.bind(this);
  },

  play: function () {
    window.addEventListener('keyup', this.onKeyup, false);
  },

  pause: function () {
    window.removeEventListener('keyup', this.onKeyup);
  },

  onKeyup: function (evt) {
    var scene = this.el;
    if (!shouldCaptureKeyEvent(evt)) { return; }
    if (this.data.enterVR && evt.keyCode === 70) {  // f.
      scene.enterVR();
    }
    if (this.data.exitVR && evt.keyCode === 27) {   // escape.
      scene.exitVR();
    }
  }
});
