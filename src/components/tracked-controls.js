var registerComponent = require('../core/component').registerComponent;
var controllerUtils = require('../utils/tracked-controls');
var THREE = require('../lib/three');
var DEFAULT_CAMERA_HEIGHT = require('../constants').DEFAULT_CAMERA_HEIGHT;

var DEFAULT_HANDEDNESS = require('../constants').DEFAULT_HANDEDNESS;
// Vector from eyes to elbow (divided by user height).
var EYES_TO_ELBOW = {x: 0.175, y: -0.3, z: -0.03};
// Vector from eyes to elbow (divided by user height).
var FOREARM = {x: 0, y: 0, z: -0.175};

/**
 * Tracked controls component.
 * Wrap the gamepad API for pose and button states.
 * Select the appropriate controller and apply pose to the entity.
 * Observe button states and emit appropriate events.
 *
 * @property {number} controller - Index of controller in array returned by Gamepad API. Only used if hand property is not set.
 * @property {string} id - Selected controller among those returned by Gamepad API.
 * @property {number} hand - If multiple controllers found with id, choose the one with the given value for hand. If set, we ignore 'controller' property
 */
module.exports.Component = registerComponent('tracked-controls', {
  schema: {
    controller: {default: 0},
    id: {type: 'string', default: ''},
    hand: {type: 'string', default: ''},
    idPrefix: {type: 'string', default: ''},
    rotationOffset: {default: 0},
    // Arm model parameters when not 6DoF.
    armModel: {default: true},
    headElement: {type: 'selector'}
  },

  init: function () {
    this.axis = [0, 0, 0];
    this.buttonStates = {};
    this.targetControllerNumber = this.data.controller;

    this.dolly = new THREE.Object3D();
    this.controllerEuler = new THREE.Euler();
    this.controllerEuler.order = 'YXZ';
    this.controllerPosition = new THREE.Vector3();
    this.controllerQuaternion = new THREE.Quaternion();
    this.deltaControllerPosition = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.rotation = {};
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
  defaultUserHeight: function () {
    return DEFAULT_CAMERA_HEIGHT;
  },

  /**
   * Return head element to use for non-6DOF arm model.
   */
  getHeadElement: function () {
    return this.data.headElement || this.el.sceneEl.camera.el;
  },

  /**
   * Handle update controller match criteria (such as `id`, `idPrefix`, `hand`, `controller`)
   */
  updateGamepad: function () {
    var data = this.data;
    var controller = controllerUtils.findMatchingController(
      this.system.controllers,
      data.id,
      data.idPrefix,
      data.hand,
      data.controller
    );

    this.controller = controller;
  },

  applyArmModel: function (controllerPosition) {
    // Use controllerPosition and deltaControllerPosition to avoid creating variables.
    var controller = this.controller;
    var controllerEuler = this.controllerEuler;
    var controllerQuaternion = this.controllerQuaternion;
    var deltaControllerPosition = this.deltaControllerPosition;
    var hand;
    var headCamera;
    var headEl;
    var headObject3D;
    var pose;
    var userHeight;

    headEl = this.getHeadElement();
    headObject3D = headEl.object3D;
    headCamera = headEl.components.camera;
    userHeight = (headCamera ? headCamera.data.userHeight : 0) || this.defaultUserHeight();

    pose = controller.pose;
    hand = (controller ? controller.hand : undefined) || DEFAULT_HANDEDNESS;

    // Use camera position as head position.
    controllerPosition.copy(headObject3D.position);
    // Set offset for degenerate "arm model" to elbow.
    deltaControllerPosition.set(
      EYES_TO_ELBOW.x * (hand === 'left' ? -1 : hand === 'right' ? 1 : 0),
      EYES_TO_ELBOW.y,  // Lower than our eyes.
      EYES_TO_ELBOW.z);  // Slightly out in front.
    // Scale offset by user height.
    deltaControllerPosition.multiplyScalar(userHeight);
    // Apply camera Y rotation (not X or Z, so you can look down at your hand).
    deltaControllerPosition.applyAxisAngle(headObject3D.up, headObject3D.rotation.y);
    // Apply rotated offset to position.
    controllerPosition.add(deltaControllerPosition);

    // Set offset for degenerate "arm model" forearm. Forearm sticking out from elbow.
    deltaControllerPosition.set(FOREARM.x, FOREARM.y, FOREARM.z);
    // Scale offset by user height.
    deltaControllerPosition.multiplyScalar(userHeight);
    // Apply controller X/Y rotation (tilting up/down/left/right is usually moving the arm).
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
    var elPosition;
    var previousControllerPosition = this.previousControllerPosition;
    var dolly = this.dolly;
    var el = this.el;
    var pose;
    var standingMatrix = this.standingMatrix;
    var vrDisplay = this.system.vrDisplay;
    var headEl = this.getHeadElement();
    var headCamera = headEl.components.camera;
    var userHeight = (headCamera ? headCamera.data.userHeight : 0) || this.defaultUserHeight();

    if (!controller) { return; }

    // Compose pose from Gamepad.
    pose = controller.pose;
    if (pose.orientation !== null) {
      dolly.quaternion.fromArray(pose.orientation);
    }

    // controller position or arm model
    if (pose.position !== null) {
      dolly.position.fromArray(pose.position);
    } else {
      // Controller not 6DOF, apply arm model.
      if (this.data.armModel) { this.applyArmModel(dolly.position); }
    }

    // Apply transforms, if 6DOF and in VR.
    if (pose.position != null && vrDisplay) {
      if (vrDisplay.stageParameters) {
        standingMatrix.fromArray(vrDisplay.stageParameters.sittingToStandingTransform);
        dolly.matrix.compose(dolly.position, dolly.quaternion, dolly.scale);
        dolly.matrix.multiplyMatrices(standingMatrix, dolly.matrix);
      } else {
        // Apply default camera height
        dolly.position.y += userHeight;
        dolly.matrix.compose(dolly.position, dolly.quaternion, dolly.scale);
      }
    } else {
      dolly.matrix.compose(dolly.position, dolly.quaternion, dolly.scale);
    }

    // Decompose.
    controllerEuler.setFromRotationMatrix(dolly.matrix);
    controllerPosition.setFromMatrixPosition(dolly.matrix);

    // Apply rotation.
    this.rotation.x = THREE.Math.radToDeg(controllerEuler.x);
    this.rotation.y = THREE.Math.radToDeg(controllerEuler.y);
    this.rotation.z = THREE.Math.radToDeg(controllerEuler.z) + this.data.rotationOffset;
    el.setAttribute('rotation', this.rotation);

    // Apply position.
    elPosition = el.getAttribute('position');
    this.position.copy(elPosition).sub(previousControllerPosition).add(controllerPosition);
    el.setAttribute('position', this.position);
    previousControllerPosition.copy(controllerPosition);
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
