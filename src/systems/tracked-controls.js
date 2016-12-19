var registerSystem = require('../core/system').registerSystem;
var trackedControlsUtils = require('../utils/tracked-controls');
var utils = require('../utils');

/**
 * Tracked controls system.
 * It maintains a list with the available tracked controllers
 */
module.exports.System = registerSystem('tracked-controls', {
  init: function () {
    var self = this;
    this.controllers = [];
    this.lastControllersUpdate = 0;
    // Throttle the (renamed) tick handler to minimum 10ms interval.
    this.tick = utils.throttleTick(this.throttledTick, 10, this);
    if (!navigator.getVRDisplays) { return; }
    navigator.getVRDisplays().then(function (displays) {
      if (displays.length > 0) {
        self.vrDisplay = displays[0];
      }
    });
  },

  updateControllerList: function () {
    var controllers = this.controllers = [];
    var gamepads = trackedControlsUtils.getGamepadsByPrefix('');
    for (var i = 0; i < gamepads.length; i++) {
      var gamepad = gamepads[i];
      if (gamepad && gamepad.pose) { controllers.push(gamepad); }
    }
  },

  // This tick handler will be throttled at init time.
  // This method was renamed only to make it clearer e.g. when debugging
  throttledTick: function (time, delta) {
    this.updateControllerList();
    this.sceneEl.emit('controllersupdated', { timestamp: time, controllers: this.controllers });
  }
});
