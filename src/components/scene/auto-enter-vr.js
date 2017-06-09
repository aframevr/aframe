var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils');

/**
 * Automatically enter VR either upon `vrdisplayactivate` (e.g. putting on Rift headset)
 * or immediately (if possible) if display name contains data string.
 * Default data string is `GearVR` for Carmel browser which only does VR.
 */
module.exports.Component = registerComponent('auto-enter-vr', {
  schema: {
    display: {type: 'string', default: 'GearVR'},
    enabled: {type: 'boolean', default: true}
  },

  init: function () {
    var scene = this.el;
    var self = this;

    // Define methods to allow mock testing.
    this.enterVR = scene.enterVR.bind(scene);
    this.exitVR = scene.exitVR.bind(scene);
    this.shouldAutoEnterVR = this.shouldAutoEnterVR.bind(this);

    if (utils.getUrlParameter('auto-enter-vr') === 'false') { return; }

    // Enter VR on `vrdisplayactivate` (e.g. putting on Rift headset).
    window.addEventListener('vrdisplayactivate', function () { self.enterVR(); }, false);

    // Exit VR on `vrdisplaydeactivate` (e.g. taking off Rift headset).
    window.addEventListener('vrdisplaydeactivate', function () { self.exitVR(); }, false);

    // Check if we should try to enter VR. Need to wait for next tick.
    setTimeout(function () {
      if (self.shouldAutoEnterVR()) {
        self.enterVR();
      }
    });
  },

  shouldAutoEnterVR: function () {
    var data = this.data;
    var display;
    var scene = this.el;

    if (!data.enabled) { return false; }

    // If we have data string to match against display name, try and get it.
    // If we can't get display name or it doesn't match, do not auto-enter VR.
    if (data.display && data.display !== 'all') {
      display = scene.effect && scene.effect.getVRDisplay && scene.effect.getVRDisplay();
      if (!display || !display.displayName || display.displayName.indexOf(data.display) < 0) {
        return false;
      }
    }

    return true;
  }
});
