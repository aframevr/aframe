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
    // Therefore, don't throttle the tick frequency; instead, optimize the update check.
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
    var prevCount;
    var thisCount;

    gamepads = navigator.getGamepads && navigator.getGamepads();
    if (!gamepads) { return; }

    // Count first, and only actually update controller list if length changes.
    prevCount = controllers.length;
    thisCount = 0;
    for (i = 0; i < gamepads.length; ++i) {
      gamepad = gamepads[i];
      if (gamepad && gamepad.pose) {
        thisCount++;
      }
    }
    if (prevCount === thisCount) { return; }

    // Update controller list.
    controllers.length = 0;
    for (i = 0; i < gamepads.length; ++i) {
      gamepad = gamepads[i];
      if (gamepad && gamepad.pose) {
        controllers.push(gamepad);
      }
    }

    if (controllers.length !== prevCount) {
      this.el.emit('controllersupdated', undefined, false);
    }
  }
});
