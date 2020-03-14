var registerSystem = require('../core/system').registerSystem;

/**
 * WebXR session initialization and XR module support.
 */
module.exports.System = registerSystem('webxr', {
  schema: {
    requiredFeatures: {type: 'array', default: ['local-floor']},
    optionalFeatures: {type: 'array', default: ['bounded-floor']},
    overlayElement: {type: 'selector'}
  },
  update: function () {
    var data =  this.data;
    this.sessionConfiguration = {
      requiredFeatures: data.requiredFeatures,
      optionalFeatures: data.optionalFeatures
    }

    if (data.overlayElement) {
      this.sessionConfiguration.domOverlay = {root: data.overlayElement};
    }
  }
});
