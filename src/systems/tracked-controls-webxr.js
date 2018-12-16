var registerSystem = require('../core/system').registerSystem;

/**
 * Tracked controls system.
 * Maintain list with available tracked controllers.
 */
module.exports.System = registerSystem('tracked-controls-webxr', {
  init: function () {
    this.controllers = [];
    this.addSessionEventListeners = this.addSessionEventListeners.bind(this);
    this.onInputSourcesChange = this.onInputSourcesChange.bind(this);
    this.addSessionEventListeners();
    this.el.sceneEl.addEventListener('enter-vr', this.addSessionEventListeners);
  },

  addSessionEventListeners: function () {
    var sceneEl = this.el;
    if (!sceneEl.xrSession) { return; }
    this.onInputSourcesChange();
    sceneEl.xrSession.addEventListener('inputsourceschange', this.onInputSourcesChange);
  },

  onInputSourcesChange: function () {
    this.controllers = this.el.xrSession.getInputSources();
    this.el.emit('controllersupdated', undefined, false);
  }
});
