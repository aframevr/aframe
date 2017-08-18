var registerSystem = require('../core/system').registerSystem;

/**
 * Tracked controls system.
 * Maintain list with available tracked controllers.
 */
module.exports.System = registerSystem('tracked-controls', {
  init: function () {
    var self = this;

    this.controllers = [];

    // For non-Firefox browsers, the gamepad poses only seem to update if getGamepads() is called.
    // Therefore, don't throttle the tick frequency.

    this.updateControllerList();

    if (!navigator.getVRDisplays) { return; }

    this.sceneEl.addEventListener('enter-vr', function () {
      navigator.getVRDisplays().then(function (displays) {
        if (displays.length) { self.vrDisplay = displays[0]; }
      });
    });
  },

  tick: function () {
    this.updateControllerList();
  },

  /**
   * Update controller list.
   */
  updateControllerList: function () {
    var controllers = this.controllers;
    var gamepad;
    var gamepads;
    var i;

    gamepads = navigator.getGamepads && navigator.getGamepads();
    if (!gamepads) { return; }

    controllers.length = 0;
    for (i = 0; i < gamepads.length; ++i) {
      gamepad = gamepads[i];
      if (gamepad && gamepad.pose) {
        controllers.push(gamepad);
      }
    }

    this.el.emit('controllersupdated', undefined, false);
  }
});
