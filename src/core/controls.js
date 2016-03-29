var component = require('./component');
var systems = require('./system');
var utils = require('../utils/');

// Keep track of registered controls.
var controls = module.exports.controls = {
  movementControls: {},
  rotationControls: {}
};

/**
 * Initializes the A-Frame controls system.
 */
systems.registerSystem('controls', {
  init: function () {
    // Names of enabled movement/rotation controls, in order of precedence.
    this.enabledMovementControls = [];
    this.enabledRotationControls = [];

    // Controls components registered to update object position/rotation.
    this.movementControls = controls.movementControls;
    this.rotationControls = controls.rotationControls;
  },

  /**
   * Enables the given component names, and sets the given order as their precedence.
   * @param {Array<string>} controls
   */
  enableMovementControls: function (controls) {
    this.enabledMovementControls = controls;
  },

  /**
   * Enables the given component names, and sets the given order as their precedence.
   * @param {Array<string>} controls
   */
  enableRotationControls: function (controls) {
    this.enabledRotationControls = controls;
  },

  /**
   * Returns the first active movement controls component, if any.
   * @param {Element} el
   * @return {ControlsComponent}
   */
  getActiveMovementControls: function (el) {
    var control;
    var names = this.enabledMovementControls;
    for (var i = 0, l = names.length; i < l; i++) {
      control = el.components[names[i]];
      if (control && control.isVelocityActive()) {
        return control;
      }
    }
    return null;
  },

  /**
   * Returns the first active rotation controls component, if any.
   * @param {Element} el
   * @return {ControlsComponent}
   */
  getActiveRotationControls: function (el) {
    var control;
    var names = this.enabledRotationControls;
    for (var i = 0, l = names.length; i < l; i++) {
      control = el.components[names[i]];
      if (control && control.isRotationActive()) {
        return control;
      }
    }
    return null;
  }
});

/**
 * Prototype for controls components.
 */
var ControlsComponent = module.exports.ControlsComponent = function () {};

ControlsComponent.prototype = {

  /**
   * Init handler. Called during scene initialization and is only run once.
   * Controls can use this to set initial state.
   */
  init: function () { /* no-op */ },

  /**
   * Tick handler.
   * Called on each tick of the scene render loop.
   * Affected by play and pause.
   *
   * @param {number} time - Scene tick time.
   * @param {number} timeDelta - Difference in current render time and previous render time.
   */
  tick: undefined,

  /**
   * Called to start any dynamic controls behavior.
   */
  play: function () { /* no-op */ },

  /**
   * Called to stop any dynamic controls behavior.
   */
  pause: function () { /* no-op */ },

  /**
   * Returns true if this control is actively in use for movement. For example, a connected gamepad
   * should return false unless the left joystick is tilted.
   * @returns {boolean}
   */
  isVelocityActive: undefined,

  /**
   * Returns a final THREE.Vector3 velocity.
   * @returns {THREE.Vector3}
   */
  getVelocity: undefined,

  /**
   * Returns an incremental THREE.Vector3 velocity change, with values on interval [-1,1]. In
   * general, this will affect the X and Z axes.
   * @returns {THREE.Vector3}
   */
  getVelocityDelta: undefined,

  /**
   * Returns true if the control is actively in use. For example, mouse controls would only return
   * true if the mouse is currently moving. HMD controls return true any time an HMD is detected.
   * @type {boolean}
   */
  isRotationActive: undefined,

  /**
   * Returns a final THREE.Vector3 (XYZ euler) world orientation, in degrees.
   * @returns {THREE.Vector3}
   */
  getRotation: undefined,

  /**
   * Returns an incremental THREE.Vector2 rotation change, with X and Y rotation values. To be
   * calibrated, values should be on the range [-1,1].
   * @returns {THREE.Vector2}
   */
  getRotationDelta: undefined
};

module.exports.registerControls = function (name, definition) {
  var NewControlsComponent;

  if (controls.movementControls[name] || controls.rotationControls[name]) {
    throw new Error('The control `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same controls ' +
                    'or two different controls of the same name.');
  }

  // Register new controls component, assigned to the `controls` system.
  var extendedDefinition = utils.extend({}, ControlsComponent.prototype, definition);
  NewControlsComponent = component.registerComponent(name, extendedDefinition);
  NewControlsComponent.prototype.system = systems.systems.controls;

  if (NewControlsComponent.prototype.isVelocityActive) {
    controls.movementControls[name] = {
      Component: NewControlsComponent
    };
  }

  if (NewControlsComponent.prototype.isRotationActive) {
    controls.rotationControls[name] = {
      Component: NewControlsComponent
    };
  }

  return NewControlsComponent;
};
