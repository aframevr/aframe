var registerSystem = require('../core/system').registerSystem;
var utils = require('../utils');

/**
 * Tracked controls system.
 * Maintain list with available tracked controllers.
 */
module.exports.System = registerSystem('tracked-controls-webxr', {
  init: function () {
    this.controllers = [];
    this.oldControllers = [];
    this.oldControllersLength = 0;
    this.throttledUpdateControllerList = utils.throttle(this.updateControllerList, 500, this);
    this.updateReferenceSpace = this.updateReferenceSpace.bind(this);
    this.el.addEventListener('enter-vr', this.updateReferenceSpace);
    this.el.addEventListener('exit-vr', this.updateReferenceSpace);
  },

  tick: function () {
    this.throttledUpdateControllerList();
  },

  updateReferenceSpace: function () {
    var self = this;
    var xrSession = this.el.xrSession;

    if (!xrSession) {
      this.referenceSpace = undefined;
      this.controllers = [];
      if (this.oldControllersLength > 0) {
        this.oldControllersLength = 0;
        this.el.emit('controllersupdated', undefined, false);
      }
      return;
    }
    var refspace = self.el.sceneEl.systems.webxr.sessionReferenceSpaceType;
    xrSession.requestReferenceSpace(refspace).then(function (referenceSpace) {
      self.referenceSpace = referenceSpace;
    }).catch(function (err) {
      self.el.sceneEl.systems.webxr.warnIfFeatureNotRequested(
          refspace,
          'tracked-controls-webxr uses reference space "' + refspace + '".');
      throw err;
    });
  },

  updateControllerList: function () {
    var xrSession = this.el.xrSession;
    var oldControllers = this.oldControllers;
    var i;
    if (!xrSession) {
      if (this.oldControllersLength === 0) { return; }
      // Broadcast that we now have zero controllers connected if there is
      // no session
      this.oldControllersLength = 0;
      this.controllers = [];
      this.el.emit('controllersupdated', undefined, false);
      return;
    }

    if (!xrSession.inputSources) { return; }
    this.controllers = xrSession.inputSources;
    if (this.oldControllersLength === this.controllers.length) {
      var equal = true;
      for (i = 0; i < this.controllers.length; ++i) {
        if (this.controllers[i] === oldControllers[i] &&
            this.controllers[i].gamepad === oldControllers[i].gamepad) { continue; }
        equal = false;
        break;
      }
      if (equal) { return; }
    }

    // Store reference to current controllers
    oldControllers.length = 0;
    for (i = 0; i < this.controllers.length; i++) {
      oldControllers.push(this.controllers[i]);
    }

    this.oldControllersLength = this.controllers.length;
    this.el.emit('controllersupdated', undefined, false);
  }
});
