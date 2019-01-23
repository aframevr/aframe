var registerSystem = require('../core/system').registerSystem;
var utils = require('../utils');

/**
 * Tracked controls system.
 * Maintain list with available tracked controllers.
 */
module.exports.System = registerSystem('tracked-controls-webxr', {
  init: function () {
    this.controllers = [];
    this.throttledUpdateControllerList = utils.throttle(this.updateControllerList, 500, this);
  },

  tick: function () {
    this.throttledUpdateControllerList();
  },

  updateControllerList: function () {
    var oldControllersLength = this.controllers.length;
    if (!this.el.xrSession) { return; }
    this.controllers = this.el.xrSession.getInputSources();
    if (oldControllersLength === this.controllers.length) { return; }
    this.el.emit('controllersupdated', undefined, false);
  }
});
