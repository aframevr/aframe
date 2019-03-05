var registerComponent = require('../core/component').registerComponent;
var controllerUtils = require('../utils/tracked-controls');
var DEFAULT_CAMERA_HEIGHT = require('../constants').DEFAULT_CAMERA_HEIGHT;
var THREE = require('../lib/three');

var DEFAULT_HANDEDNESS = require('../constants').DEFAULT_HANDEDNESS;
// Vector from eyes to elbow (divided by user height).
var EYES_TO_ELBOW = {x: 0.175, y: -0.3, z: -0.03};
// Vector from eyes to elbow (divided by user height).
var FOREARM = {x: 0, y: 0, z: -0.175};

// Due to unfortunate name collision, add empty touches array to avoid Daydream error.
var EMPTY_DAYDREAM_TOUCHES = {touches: []};

var EVENTS = {
  AXISMOVE: 'axismove',
  BUTTONCHANGED: 'buttonchanged',
  BUTTONDOWN: 'buttondown',
  BUTTONUP: 'buttonup',
  TOUCHSTART: 'touchstart',
  TOUCHEND: 'touchend'
};

/**
 * Tracked controls component.
 * Wrap the gamepad API for pose and button states.
 * Select the appropriate controller and apply pose to the entity.
 * Observe button states and emit appropriate events.
 *
 * @property {number} controller - Index of controller in array returned by Gamepad API.
 *  Only used if hand property is not set.
 * @property {string} id - Selected controller among those returned by Gamepad API.
 * @property {number} hand - If multiple controllers found with id, choose the one with the
 *  given value for hand. If set, we ignore 'controller' property
 */
module.exports.Component = registerComponent('tracked-controls-webvr', {
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

  init: function () {
    // Copy variables back to tracked-controls for backwards compatibility.
    // Some 3rd components rely on them.
    this.axis = this.el.components['tracked-controls'].axis = [0, 0, 0];
    this.buttonStates = this.el.components['tracked-controls'].buttonStates = {};
    this.changedAxes = [];
    this.targetControllerNumber = this.data.controller;

    this.axisMoveEventDetail = {axis: this.axis, changed: this.changedAxes};
    this.deltaControllerPosition = new THREE.Vector3();
    this.controllerQuaternion = new THREE.Quaternion();
    this.controllerEuler = new THREE.Euler();

    this.updateGamepad();

    this.buttonEventDetails = {};
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
    var controller = controllerUtils.findMatchingControllerWebVR(
      this.system.controllers,
      data.id,
      data.idPrefix,
      data.hand,
      data.controller
    );

    this.controller = controller;
    // Legacy handle to the controller for old components.
    this.el.components['tracked-controls'].controller = controller;

    if (this.data.autoHide) { this.el.object3D.visible = !!this.controller; }
  },

  /**
   * Applies an artificial arm model to simulate elbow to wrist positioning
   * based on the orientation of the controller.
   *
   * @param {object} controllerPosition - Existing vector to update with controller position.
   */
  applyArmModel: function (controllerPosition) {
    // Use controllerPosition and deltaControllerPosition to avoid creating variables.
    var controller = this.controller;
    var controllerEuler = this.controllerEuler;
    var controllerQuaternion = this.controllerQuaternion;
    var deltaControllerPosition = this.deltaControllerPosition;
    var hand;
    var headEl;
    var headObject3D;
    var pose;
    var userHeight;

    headEl = this.getHeadElement();
    headObject3D = headEl.object3D;
    userHeight = this.defaultUserHeight();

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
    var data = this.data;
    var object3D = this.el.object3D;
    var pose;
    var vrDisplay = this.system.vrDisplay;
    var standingMatrix;

    if (!controller) { return; }

    // Compose pose from Gamepad.
    pose = controller.pose;

    if (pose.position) {
      object3D.position.fromArray(pose.position);
    } else {
      // Controller not 6DOF, apply arm model.
      if (data.armModel) { this.applyArmModel(object3D.position); }
    }

    if (pose.orientation) {
      object3D.quaternion.fromArray(pose.orientation);
    }

    // Apply transforms, if 6DOF and in VR.
    if (vrDisplay && pose.position) {
      standingMatrix = this.el.sceneEl.renderer.vr.getStandingMatrix();
      object3D.matrix.compose(object3D.position, object3D.quaternion, object3D.scale);
      object3D.matrix.multiplyMatrices(standingMatrix, object3D.matrix);
      object3D.matrix.decompose(object3D.position, object3D.quaternion, object3D.scale);
    }

    object3D.rotateX(this.data.orientationOffset.x * THREE.Math.DEG2RAD);
    object3D.rotateY(this.data.orientationOffset.y * THREE.Math.DEG2RAD);
    object3D.rotateZ(this.data.orientationOffset.z * THREE.Math.DEG2RAD);
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
      if (!this.buttonEventDetails[id]) {
        this.buttonEventDetails[id] = {id: id, state: this.buttonStates[id]};
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
    var changed;
    changed = this.handlePress(id, buttonState) |
              this.handleTouch(id, buttonState) |
              this.handleValue(id, buttonState);
    if (!changed) { return false; }
    this.el.emit(EVENTS.BUTTONCHANGED, this.buttonEventDetails[id], false);
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
    var changedAxes = this.changedAxes;

    // Check if axis changed.
    this.changedAxes.length = 0;
    for (i = 0; i < controllerAxes.length; ++i) {
      changedAxes.push(previousAxis[i] !== controllerAxes[i]);
      if (changedAxes[i]) { changed = true; }
    }
    if (!changed) { return false; }

    this.axis.length = 0;
    for (i = 0; i < controllerAxes.length; i++) {
      this.axis.push(controllerAxes[i]);
    }
    this.el.emit(EVENTS.AXISMOVE, this.axisMoveEventDetail, false);
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

    evtName = buttonState.pressed ? EVENTS.BUTTONDOWN : EVENTS.BUTTONUP;
    this.el.emit(evtName, this.buttonEventDetails[id], false);
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

    evtName = buttonState.touched ? EVENTS.TOUCHSTART : EVENTS.TOUCHEND;
    this.el.emit(evtName, this.buttonEventDetails[id], false, EMPTY_DAYDREAM_TOUCHES);
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
