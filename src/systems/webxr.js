var registerSystem = require('../core/system').registerSystem;

var utils = require('../utils/');
var warn = utils.debug('systems:webxr:warn');

/**
 * WebXR session initialization and XR module support.
 */
module.exports.System = registerSystem('webxr', {
  schema: {
    referenceSpaceType: {type: 'string', default: 'local-floor'},
    requiredFeatures: {type: 'array', default: ['local-floor']},
    optionalFeatures: {type: 'array', default: ['bounded-floor']},
    overlayElement: {type: 'selector'}
  },

  update: function () {
    var data = this.data;
    this.sessionConfiguration = {
      requiredFeatures: data.requiredFeatures,
      optionalFeatures: data.optionalFeatures
    };
    this.sessionReferenceSpaceType = data.referenceSpaceType;

    if (data.overlayElement) {
      // Update WebXR to support light-estimation
      data.overlayElement.classList.remove('a-dom-overlay');
      if (!data.optionalFeatures.includes('dom-overlay')) {
        data.optionalFeatures.push('dom-overlay');
        this.el.setAttribute('webxr', data);
      }
      this.warnIfFeatureNotRequested('dom-overlay');
      this.sessionConfiguration.domOverlay = {root: data.overlayElement};
      data.overlayElement.classList.add('a-dom-overlay');
    }
  },

  wasFeatureRequested: function (feature) {
    // Features available by default for immersive sessions don't need to
    // be requested explicitly.
    if (feature === 'viewer' || feature === 'local') { return true; }

    if (this.sessionConfiguration.requiredFeatures.includes(feature) ||
        this.sessionConfiguration.optionalFeatures.includes(feature)) {
      return true;
    }

    return false;
  },

  warnIfFeatureNotRequested: function (feature, optIntro) {
    if (!this.wasFeatureRequested(feature)) {
      var msg = 'Please add the feature "' + feature + '" to a-scene\'s ' +
          'webxr system options in requiredFeatures/optionalFeatures.';
      warn((optIntro ? optIntro + ' ' : '') + msg);
    }
  }
});
