var registerSystem = require('../core/system').registerSystem;
var controls = require('../core/controls').controls;

/**
 * Initializes the A-Frame controls system.
 */
module.exports.System = registerSystem('controls', {
  hasPositionControls: function (name) {
    return !!controls.positionControls[name];
  },

  hasRotationControls: function (name) {
    return !!controls.rotationControls[name];
  }
});
