var registerSystem = require('../core/system').registerSystem;
var trackedControlsUtils = require('../utils/tracked-controls');

/**
 * Tracked controls system.
 * It maintains a list with the available tracked controllers
 */
module.exports.System = registerSystem('tracked-controls', {
  init: function () {
    var self = this;
    this.controllers = [];
    this.lastControllersUpdate = 0;
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

  tick: function (time) {
    if (time < this.lastControllersUpdate + 10) { return; }
    this.lastControllersUpdate = time;
    this.updateControllerList();
    this.sceneEl.emit('controllersupdated', { timestamp: time, controllers: this.controllers });
  }
});
