var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var DEFAULT_USER_HEIGHT = require('../constants').DEFAULT_USER_HEIGHT;

var DEFAULT_HANDEDNESS = require('../constants').DEFAULT_HANDEDNESS;
var EYES_TO_ELBOW = {x: 0.175, y: -0.3, z: -0.03}; // vector from eyes to elbow (divided by user height)
var FOREARM = {x: 0, y: 0, z: -0.175}; // vector from eyes to elbow (divided by user height)

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
    rotationOffset: {default: 0},
    // Arm model parameters, to use when not 6DOF. (pose hasPosition false, no position)
    headElement: {type: 'selector'}
  },

  init: function () {
    this.axis = [0, 0, 0];
    this.buttonStates = {};

    this.dolly = new THREE.Object3D();
    this.controllerEuler = new THREE.Euler();
    this.controllerEuler.order = 'YXZ';
    this.controllerPosition = new THREE.Vector3();
    this.controllerQuaternion = new THREE.Quaternion();
    this.deltaControllerPosition = new THREE.Vector3();
    this.standingMatrix = new THREE.Matrix4();

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
   * Return default user height to use for non-6DOF arm model.
   */
  defaultUserHeight: function () { return DEFAULT_USER_HEIGHT; }, // default user height (for cameras with zero)

  /**
   * Return head element to use for non-6DOF arm model.
   */
  getHeadElement: function () { return this.data.headElement || this.el.sceneEl.camera.el; },

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

  applyArmModel: function (controllerPosition) {
      // Use controllerPosition and deltaControllerPosition to avoid creating yet more variables...
    var controller = this.controller;
    var pose = controller.pose;
    var controllerQuaternion = this.controllerQuaternion;
    var controllerEuler = this.controllerEuler;
    var deltaControllerPosition = this.deltaControllerPosition;
    var hand = (controller ? controller.hand : undefined) || DEFAULT_HANDEDNESS;
    var headEl = this.getHeadElement();
    var headObject3D = headEl.object3D;
    var headCamera = headEl.components.camera;
    var userHeight = (headCamera ? headCamera.data.userHeight : 0) || this.defaultUserHeight();

    // Use camera position as head position.
    controllerPosition.copy(headObject3D.position);
    // Set offset for degenerate "arm model" to elbow.
    deltaControllerPosition.set(
      EYES_TO_ELBOW.x * (hand === 'left' ? -1 : hand === 'right' ? 1 : 0),
      EYES_TO_ELBOW.y, // lower than your eyes
      EYES_TO_ELBOW.z); // slightly out in front
    // Scale offset by user height.
    deltaControllerPosition.multiplyScalar(userHeight);
    // Apply camera Y rotation (not X or Z, so you can look down at your hand).
    deltaControllerPosition.applyAxisAngle(headObject3D.up, headObject3D.rotation.y);
    // Apply rotated offset to position.
    controllerPosition.add(deltaControllerPosition);

    // Set offset for degenerate "arm model" forearm.
    deltaControllerPosition.set(FOREARM.x, FOREARM.y, FOREARM.z); // forearm sticking out from elbow
    // Scale offset by user height.
    deltaControllerPosition.multiplyScalar(userHeight);
    // Apply controller X and Y rotation (tilting up/down/left/right is usually moving the arm)
    if (pose.orientation) {
      controllerQuaternion.fromArray(pose.orientation);
    } else {
      controllerQuaternion.copy(headObject3D.quaternion);
    }
    controllerEuler.setFromQuaternion(controllerQuaternion);
    controllerEuler.set(controllerEuler.x, controllerEuler.y, 0);
    deltaControllerPosition.applyEuler(controllerEuler);
    // Apply rotated offset to position.
    controllerPosition.add(deltaControllerPosition);
  },

  /**
   * Read pose from controller (from Gamepad API), apply transforms, apply to entity.
   */
  updatePose: function () {
    var controller = this.controller;
    var controllerEuler = this.controllerEuler;
    var controllerPosition = this.controllerPosition;
    var currentPosition;
    var deltaControllerPosition = this.deltaControllerPosition;
    var dolly = this.dolly;
    var el = this.el;
    var pose;
    var standingMatrix = this.standingMatrix;
    var vrDisplay = this.system.vrDisplay;
    var headEl = this.getHeadElement();
    var headObject3D = headEl.object3D;
    var headCamera = headEl.components.camera;
    var userHeight = (headCamera ? headCamera.data.userHeight : 0) || this.defaultUserHeight();

    if (!controller) { return; }

    // Compose pose from Gamepad.
    pose = controller.pose;
    // If no orientation, use camera.
    if (pose.orientation) {
      dolly.quaternion.fromArray(pose.orientation);
    } else {
      dolly.quaternion.copy(headObject3D.quaternion);
    }
    if (pose.position) {
      dolly.position.fromArray(pose.position);
    } else {
      // The controller is not 6DOF, so apply arm model.
      this.applyArmModel(controllerPosition);
      dolly.position.copy(controllerPosition);
    }
    dolly.updateMatrix();

    // Apply transforms, if 6DOF and in VR.
    if (pose.position && vrDisplay) {
      if (vrDisplay.stageParameters) {
        standingMatrix.fromArray(vrDisplay.stageParameters.sittingToStandingTransform);
        dolly.applyMatrix(standingMatrix);
      } else {
        // Apply default camera height
        dolly.position.y += userHeight;
        dolly.updateMatrix();
      }
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

    // Apply position (as delta from previous Gamepad position).
    deltaControllerPosition.copy(controllerPosition).sub(this.previousControllerPosition);
    this.previousControllerPosition.copy(controllerPosition);
    currentPosition = el.getAttribute('position');
    el.setAttribute('position', {
      x: currentPosition.x + deltaControllerPosition.x,
      y: currentPosition.y + deltaControllerPosition.y,
      z: currentPosition.z + deltaControllerPosition.z
    });
  },

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
    var changedAxes = [];

    // Check if axis changed.
    for (i = 0; i < controllerAxes.length; ++i) {
      changedAxes.push(previousAxis[i] !== controllerAxes[i]);
      if (changedAxes[i]) { changed = true; }
    }
    if (!changed) { return false; }

    this.axis = controllerAxes.slice();
    this.el.emit('axismove', {axis: this.axis, changed: changedAxes});
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
    // Due to unfortunate name collision, add empty touches array to avoid Daydream error.
    this.el.emit('touch' + evtName, {id: id, state: buttonState}, true, {touches: []});
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
