var registerSystem = require('../core/system').registerSystem;

/**
 * WebXR DOM Overlay support.
 */
module.exports.System = registerSystem('dom-overlay', {
  schema: {
    rootElement: {default: document.body, type: 'selector'},
    required: {default: false, type: 'boolean'}
  },

  init: function () {
    var xrinit = this.sceneEl.systems.renderer.xrSessionInit;
    if (this.data.required) {
      xrinit.requiredFeatures.push('dom-overlay');
    } else {
      xrinit.optionalFeatures.push('dom-overlay');
    }
    xrinit.domOverlay = {root: this.data.rootElement};
  }
});
