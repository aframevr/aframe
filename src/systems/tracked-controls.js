var registerSystem = require('../core/system').registerSystem;

/**
 * Tracked controls system.
 * Maintain list with available tracked controllers.
 */
module.exports.System = registerSystem('tracked-controls', {
  init: function () {
    var self = this;

    this.controllers = [];

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

    gamepads = navigator.getGamepads && navigator.getGamepads();
    if (!gamepads) { return; }

    prevCount = controllers.length;
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
