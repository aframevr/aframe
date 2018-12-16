var registerComponent = require('../core/component').registerComponent;

/**
 * Tracked controls.
 * Abstract controls that decide if the WebVR or WebXR version is going to be applied.
 *
 * @property {number} controller - Index of controller in array returned by Gamepad API.
 *  Only used if hand property is not set.
 * @property {string} id - Selected controller among those returned by Gamepad API.
 * @property {number} hand - If multiple controllers found with id, choose the one with the
 *  given value for hand. If set, we ignore 'controller' property
 */
module.exports.Component = registerComponent('tracked-controls', {
  schema: {
    autoHide: {default: true},
    controller: {default: 0},
    id: {type: 'string', default: ''},
    hand: {type: 'string', default: ''},
    idPrefix: {type: 'string', default: ''},
    orientationOffset: {type: 'vec3'},
    // Arm model parameters when not 6DoF.
    armModel: {default: true},
    headElement: {type: 'selector'}
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    if (el.sceneEl.hasWebXR) {
      el.setAttribute('tracked-controls-webxr', data);
    } else {
      el.setAttribute('tracked-controls-webvr', data);
    }
  }
});
