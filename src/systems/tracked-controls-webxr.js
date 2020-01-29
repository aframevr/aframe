var registerSystem = require('../core/system').registerSystem;
var utils = require('../utils');

/**
 * Tracked controls system.
 * Maintain list with available tracked controllers.
 */
module.exports.System = registerSystem('tracked-controls-webxr', {
  init: function () {
    this.controllers = [];
    this.oldControllersLength = 0;
    this.throttledUpdateControllerList = utils.throttle(this.updateControllerList, 500, this);
  },

  tick: function () {
    this.throttledUpdateControllerList();
  },

  updateControllerList: function () {
    var xrSession = this.el.xrSession;
    var self = this;
    if (!xrSession) {
      if (this.oldControllersLength === 0) { return; }
      // Broadcast that we now have zero controllers connected if there is
      // no session
      this.oldControllersLength = 0;
      this.controllers = [];
      this.el.emit('controllersupdated', undefined, false);
      return;
    }
    this.controllers = this.el.xrSession.inputSources;
    if (this.oldControllersLength === this.controllers.length) { return; }
    this.oldControllersLength = this.controllers.length;
    xrSession.requestReferenceSpace('local-floor').then(function (referenceSpace) {
      self.referenceSpace = referenceSpace;
    });
    this.el.emit('controllersupdated', undefined, false);
  }
});
