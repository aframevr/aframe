var registerSystem = require('../core/system').registerSystem;
var trackedControlsUtils = require('../utils/tracked-controls');
var utils = require('../utils');

/**
 * Tracked controls system.
 * It maintains a list with the available tracked controllers
 */
module.exports.System = registerSystem('tracked-controls', {
  schema: {alwaysAllowIdPrefixes: {type: 'array'}},
  init: function () {
    var self = this;
    this.controllers = [];
    this.lastControllersUpdate = 0;
    // Throttle the (renamed) tick handler to minimum 10ms interval.
    this.tick = utils.throttle(this.throttledTick, 10, this);
    if (!navigator.getVRDisplays) { return; }
    this.sceneEl.addEventListener('enter-vr', function () {
      navigator.getVRDisplays().then(function (displays) {
        if (displays.length) { self.vrDisplay = displays[0]; }
      });
    });
  },

  updateControllerList: function () {
    var controllers = this.controllers = [];
    var gamepads = trackedControlsUtils.getGamepadsByPrefix('');
    for (var i = 0; i < gamepads.length; i++) {
      var gamepad = gamepads[i];
      if (gamepad && gamepad.pose) { controllers.push(gamepad); } else
      if (gamepad && this.data.alwaysAllowIdPrefixes) {
        this.data.alwaysAllowIdPrefixes.forEach(function (idPrefix) {
          if (gamepad.id.indexOf(idPrefix) === 0) { controllers.push(gamepad); }
        });
      }
    }
  },

  /**
   * Update controller list every 10 miliseconds.
   */
  throttledTick: function () {
    this.updateControllerList();
    this.sceneEl.emit('controllersupdated', { controllers: this.controllers });
  }
});
