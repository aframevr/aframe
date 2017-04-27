var registerComponent = require('../../core/component').registerComponent;
var utils = require('../../utils');

/**
 * Automatically enter VR, either upon vrdisplayactivate (e.g. putting on Rift headset)
 * or immediately (if possible) if display name contains data string.
 * The default data string is 'GearVR' for Carmel browser which only does VR.
 */
module.exports.Component = registerComponent('auto-enter-vr', {
  schema: {
    display: {type: 'string', default: 'GearVR'},
    enabled: {type: 'boolean', default: true}
  },

  init: function () {
    var scene = this.el;
    var self = this;

    // define methods to allow mock testing
    this.enterVR = scene.enterVR.bind(scene);
    this.exitVR = scene.exitVR.bind(scene);
    this.shouldAutoEnterVR = this.shouldAutoEnterVR.bind(this);

    // don't do anything if false
    if (utils.getUrlParameter('auto-enter-vr') === 'false') { return; }

    // enter VR on vrdisplayactivate (e.g. putting on Rift headset)
    window.addEventListener('vrdisplayactivate', function () { self.enterVR(); }, false);

    // exit VR on vrdisplaydeactivate (e.g. taking off Rift headset)
    window.addEventListener('vrdisplaydeactivate', function () { self.exitVR(); }, false);

    // check if we should try to enter VR... turns out we need to wait for next tick
    setTimeout(function () { if (self.shouldAutoEnterVR()) { self.enterVR(); } }, 0);
  },

  update: function () {
    return this.shouldAutoEnterVR() ? this.enterVR() : this.exitVR();
  },

  shouldAutoEnterVR: function () {
    var scene = this.el;
    var data = this.data;
    // if false, we should not auto-enter VR
    if (!data.enabled) { return false; }
    // if we have a data string to match against display name, try and get it;
    // if we can't get display name, or it doesn't match, we should not auto-enter VR
    if (data.display && data.display !== 'all') {
      var display = scene.effect && scene.effect.getVRDisplay && scene.effect.getVRDisplay();
      if (!display || !display.displayName || display.displayName.indexOf(data.display) < 0) { return false; }
    }
    // we should auto-enter VR
    return true;
  }
});

