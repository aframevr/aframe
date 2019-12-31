/* global AFRAME */

/**
 * Loads and setup ground model.
 */
AFRAME.registerComponent('ar-controls', {
  init: function () {
    this.updateControllers = this.updateControllers.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.el.sceneEl.addEventListener('controllersupdated', this.updateControllers);
  },

  updateControllers: function () {
    var controllers = this.el.systems['tracked-controls-webxr'].controllers;
    var i;
    var xrSession = this.el.xrSession;
    if (!xrSession) { return; }
    for (i = 0; i < controllers.length; ++i) {
      if (controllers[i].targetRayMode === 'screen') {
        this.controller = controllers[i];
        xrSession.addEventListener('select', this.onSelect);
        break;
      }
    }
  },

  onSelect: function (evt) {
    if (this.controller !== evt.inputSource) { return; }
  }
});
