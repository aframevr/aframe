var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils');

/**
 * Automatically enter VR, either upon vrdisplayactivate or immediately if possible.
 */
module.exports.Component = registerComponent('auto-enter-vr', {
  schema: {default: 'GearVR'},

  init: function () {
    var scene = this.el;

    if (utils.getUrlParameter('auto-enter-vr') === 'false') { return; }

    window.addEventListener('vrdisplayactivate', function () {
      scene.enterVR();
    }, false);

    window.addEventListener('vrdisplaydeactivate', function () {
      scene.exitVR();
    }, false);

    this.shouldAutoEnterVR = this.shouldAutoEnterVR.bind(this);

    // just try to enter... turns out we need to wait for next tick
    var self = this;
    setTimeout(function () { if (self.shouldAutoEnterVR()) { scene.enterVR(); } }, 0);
  },

  update: function () {
    return this.shouldAutoEnterVR() ? this.el.enterVR() : this.el.exitVR();
  },

  shouldAutoEnterVR: function () {
    var scene = this.el;
    var data = this.data;
    if (data === false || data === 'false') { return false; }
    if (typeof data === 'string') {
      var display = scene.effect && scene.effect.getVRDisplay && scene.effect.getVRDisplay();
      if (!display || !display.displayName || display.displayName.indexOf(data) < 0) { return false; }
    }
    return true;
  }
});

