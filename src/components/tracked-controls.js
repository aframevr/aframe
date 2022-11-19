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
    controller: {default: -1},
    id: {type: 'string', default: ''},
    hand: {type: 'string', default: ''},
    idPrefix: {type: 'string', default: ''},
    handTrackingEnabled: {default: false},
    orientationOffset: {type: 'vec3'},
    // Arm model parameters when not 6DoF.
    armModel: {default: false},
    headElement: {type: 'selector'},
    iterateControllerProfiles: {default: false},
    space: {type: 'string', oneOf: ['targetRaySpace', 'gripSpace'], default: 'targetRaySpace'}
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    if (el.sceneEl.hasWebXR) {
      el.setAttribute('tracked-controls-webxr', {
        id: data.id,
        hand: data.hand,
        index: data.controller,
        iterateControllerProfiles: data.iterateControllerProfiles,
        handTrackingEnabled: data.handTrackingEnabled,
        space: data.space
      });
    } else {
      el.setAttribute('tracked-controls-webvr', data);
    }
  }
});
