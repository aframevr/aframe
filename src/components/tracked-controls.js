var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

/**
 * Tracked controls component.
 * Wrap the gamepad API for pose and button states.
 * Select the appropriate controller and apply pose to the entity.
 * Observe button states and emit appropriate events.
 *
 * @property {number} controller - Index of controller in array returned by Gamepad API.
 * @property {string} id - Selected controller among those returned by Gamepad API.
 */
module.exports.Component = registerComponent('tracked-controls', {
  schema: {
    controller: {default: 0},
    id: {type: 'string', default: ''},
    idPrefix: {type: 'string', default: ''},
    rotationOffset: {default: 0}
  },

  init: function () {
    this.axis = [0, 0, 0];
    this.buttonStates = {};
    this.previousControllerPosition = new THREE.Vector3();
    this.updateGamepad();
  },

  tick: function (time, delta) {
    var mesh = this.el.getObject3D('mesh');
    // Update mesh animations.
    if (mesh && mesh.update) { mesh.update(delta / 1000); }
    this.updateGamepad();
    this.updatePose();
    this.updateButtons();
  },

  /**
   * Handle update to `id` or `idPrefix.
   */
  updateGamepad: function () {
    var controllers = this.system.controllers;
    var data = this.data;
    var matchingControllers;

    // Hand IDs: 0 is right, 1 is left.
    matchingControllers = controllers.filter(function hasIdOrPrefix (controller) {
      if (data.idPrefix) { return controller.id.indexOf(data.idPrefix) === 0; }
      return controller.id === data.id;
    });

    this.controller = matchingControllers[data.controller];
  },

  /**
   * Read pose from controller (from Gamepad API), apply transforms, apply to entity.
   */
  updatePose: (function () {
    var controllerEuler = new THREE.Euler();
    var controllerPosition = new THREE.Vector3();
    var controllerQuaternion = new THREE.Quaternion();
    var deltaControllerPosition = new THREE.Vector3();
    var dolly = new THREE.Object3D();
    var standingMatrix = new THREE.Matrix4();
    controllerEuler.order = 'YXZ';

    return function () {
      var controller = this.controller;
      var currentPosition;
      var el = this.el;
      var orientation;
      var pose;
      var position;
      var vrDisplay = this.system.vrDisplay;

      if (!controller) { return; }

      // Compose pose from Gamepad.
      pose = controller.pose;
      orientation = pose.orientation || [0, 0, 0, 1];
      position = pose.position || [0, 0, 0];
      controllerQuaternion.fromArray(orientation);
      dolly.quaternion.fromArray(orientation);
      dolly.position.fromArray(position);
      dolly.updateMatrix();

      // Apply transforms.
      if (vrDisplay && vrDisplay.stageParameters) {
        standingMatrix.fromArray(vrDisplay.stageParameters.sittingToStandingTransform);
        dolly.applyMatrix(standingMatrix);
      }

      // Decompose.
      controllerEuler.setFromRotationMatrix(dolly.matrix);
      controllerPosition.setFromMatrixPosition(dolly.matrix);

      // Apply rotation (as absolute, with rotation offset).
      el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(controllerEuler.x),
        y: THREE.Math.radToDeg(controllerEuler.y),
        z: THREE.Math.radToDeg(controllerEuler.z) + this.data.rotationOffset
      });

      // Apply position (as delta from previous Gamepad rotation).
      deltaControllerPosition.copy(controllerPosition).sub(this.previousControllerPosition);
      this.previousControllerPosition.copy(controllerPosition);
      currentPosition = el.getAttribute('position');
      el.setAttribute('position', {
        x: currentPosition.x + deltaControllerPosition.x,
        y: currentPosition.y + deltaControllerPosition.y,
        z: currentPosition.z + deltaControllerPosition.z
      });
    };
  })(),

  /**
   * Handle button changes including axes, presses, touches, values.
   */
  updateButtons: function () {
    var buttonState;
    var controller = this.controller;
    var id;

    if (!controller) { return; }

    // Check every button.
    for (id = 0; id < controller.buttons.length; ++id) {
      // Initialize button state.
      if (!this.buttonStates[id]) {
        this.buttonStates[id] = {pressed: false, touched: false, value: 0};
      }

      buttonState = controller.buttons[id];
      this.handleButton(id, buttonState);
    }
    // Check axes.
    this.handleAxes();
  },

  /**
   * Handle presses and touches for a single button.
   *
   * @param {number} id - Index of button in Gamepad button array.
   * @param {number} buttonState - Value of button state from 0 to 1.
   * @returns {boolean} Whether button has changed in any way.
   */
  handleButton: function (id, buttonState) {
    var changed = this.handlePress(id, buttonState) ||
                  this.handleTouch(id, buttonState) ||
                  this.handleValue(id, buttonState);
    if (!changed) { return false; }
    this.el.emit('buttonchanged', {id: id, state: buttonState});
    return true;
  },

  /**
   * An axis is an array of values from -1 (up, left) to 1 (down, right).
   * Compare each component of the axis to the previous value to determine change.
   *
   * @returns {boolean} Whether axes changed.
   */
  handleAxes: function () {
    var changed = false;
    var controllerAxes = this.controller.axes;
    var i;
    var previousAxis = this.axis;

    // Check if axis changed.
    for (i = 0; i < controllerAxes.length; ++i) {
      if (previousAxis[i] !== controllerAxes[i]) {
        changed = true;
        break;
      }
    }
    if (!changed) { return false; }

    this.axis = controllerAxes.slice();
    this.el.emit('axismove', {axis: this.axis});
    return true;
  },

  /**
   * Determine whether a button press has occured and emit events as appropriate.
   *
   * @param {string} id - ID of the button to check.
   * @param {object} buttonState - State of the button to check.
   * @returns {boolean} Whether button press state changed.
   */
  handlePress: function (id, buttonState) {
    var evtName;
    var previousButtonState = this.buttonStates[id];

    // Not changed.
    if (buttonState.pressed === previousButtonState.pressed) { return false; }

    evtName = buttonState.pressed ? 'down' : 'up';
    this.el.emit('button' + evtName, {id: id, state: buttonState});
    previousButtonState.pressed = buttonState.pressed;
    return true;
  },

  /**
   * Determine whether a button touch has occured and emit events as appropriate.
   *
   * @param {string} id - ID of the button to check.
   * @param {object} buttonState - State of the button to check.
   * @returns {boolean} Whether button touch state changed.
   */
  handleTouch: function (id, buttonState) {
    var evtName;
    var previousButtonState = this.buttonStates[id];

    // Not changed.
    if (buttonState.touched === previousButtonState.touched) { return false; }

    evtName = buttonState.touched ? 'start' : 'end';
    this.el.emit('touch' + evtName, {id: id, state: buttonState});
    previousButtonState.touched = buttonState.touched;
    return true;
  },

  /**
   * Determine whether a button value has changed.
   *
   * @param {string} id - Id of the button to check.
   * @param {object} buttonState - State of the button to check.
   * @returns {boolean} Whether button value changed.
   */
  handleValue: function (id, buttonState) {
    var previousButtonState = this.buttonStates[id];

    // Not changed.
    if (buttonState.value === previousButtonState.value) { return false; }

    previousButtonState.value = buttonState.value;
    return true;
  }
});
