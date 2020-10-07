var controllerUtils = require('../utils/tracked-controls');
var registerComponent = require('../core/component').registerComponent;

var EVENTS = {
  AXISMOVE: 'axismove',
  BUTTONCHANGED: 'buttonchanged',
  BUTTONDOWN: 'buttondown',
  BUTTONUP: 'buttonup',
  TOUCHSTART: 'touchstart',
  TOUCHEND: 'touchend'
};

module.exports.Component = registerComponent('tracked-controls-webxr', {
  schema: {
    id: {type: 'string', default: ''},
    hand: {type: 'string', default: ''},
    handTrackingEnabled: {default: false},
    index: {type: 'int', default: -1},
    iterateControllerProfiles: {default: false}
  },

  init: function () {
    this.addSessionEventListeners = this.addSessionEventListeners.bind(this);
    this.updateController = this.updateController.bind(this);
    this.emitButtonUpEvent = this.emitButtonUpEvent.bind(this);
    this.emitButtonDownEvent = this.emitButtonDownEvent.bind(this);

    this.selectEventDetails = {id: 'trigger', state: {pressed: false}};
    this.buttonEventDetails = {};
    this.buttonStates = this.el.components['tracked-controls'].buttonStates = {};
    this.axis = this.el.components['tracked-controls'].axis = [0, 0, 0];
    this.changedAxes = [];
    this.axisMoveEventDetail = {axis: this.axis, changed: this.changedAxes};
  },

  update: function () {
    this.updateController();
  },

  play: function () {
    var sceneEl = this.el.sceneEl;
    this.updateController();
    this.addSessionEventListeners();
    sceneEl.addEventListener('enter-vr', this.addSessionEventListeners);
    sceneEl.addEventListener('controllersupdated', this.updateController);
  },

  pause: function () {
    var sceneEl = this.el.sceneEl;
    this.removeSessionEventListeners();
    sceneEl.removeEventListener('enter-vr', this.addSessionEventListeners);
    sceneEl.removeEventListener('controllersupdated', this.updateController);
  },

  addSessionEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    if (!sceneEl.xrSession) { return; }
    sceneEl.xrSession.addEventListener('selectstart', this.emitButtonDownEvent);
    sceneEl.xrSession.addEventListener('selectend', this.emitButtonUpEvent);
  },

  removeSessionEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    if (!sceneEl.xrSession) { return; }
    sceneEl.xrSession.removeEventListener('selectstart', this.emitButtonDownEvent);
    sceneEl.xrSession.removeEventListener('selectend', this.emitButtonUpEvent);
  },

  isControllerPresent: function (evt) {
    if (!this.controller || this.controller.gamepad) { return false; }
    if (evt.inputSource.handedness !== 'none' &&
        evt.inputSource.handedness !== this.data.hand) {
      return false;
    }
    return true;
  },

  emitButtonDownEvent: function (evt) {
    if (!this.isControllerPresent(evt)) { return; }

    this.selectEventDetails.state.pressed = true;
    this.el.emit('buttondown', this.selectEventDetails);
    this.el.emit('buttonchanged', this.selectEventDetails);
    this.el.emit('triggerdown');
  },

  emitButtonUpEvent: function (evt) {
    if (!this.isControllerPresent(evt)) { return; }

    this.selectEventDetails.state.pressed = false;
    this.el.emit('buttonup', this.selectEventDetails);
    this.el.emit('buttonchanged', this.selectEventDetails);
    this.el.emit('triggerup');
  },

  /**
   * Handle update controller match criteria (such as `id`, `idPrefix`, `hand`, `controller`)
   */
  updateController: function () {
    this.controller = controllerUtils.findMatchingControllerWebXR(
      this.system.controllers,
      this.data.id,
      this.data.hand,
      this.data.index,
      this.data.iterateControllerProfiles,
      this.data.handTrackingEnabled
    );
    // Legacy handle to the controller for old components.
    this.el.components['tracked-controls'].controller = this.controller;
    if (this.data.autoHide) { this.el.object3D.visible = !!this.controller; }
  },

  tick: function () {
    var sceneEl = this.el.sceneEl;
    var controller = this.controller;
    var frame = sceneEl.frame;
    if (!controller || !sceneEl.frame || !this.system.referenceSpace) { return; }
    if (!controller.hand) {
      this.pose = frame.getPose(controller.targetRaySpace, this.system.referenceSpace);
      this.updatePose();
      this.updateButtons();
    }
  },

  updatePose: function () {
    var object3D = this.el.object3D;
    var pose = this.pose;
    if (!pose) { return; }
    object3D.matrix.elements = pose.transform.matrix;
    object3D.matrix.decompose(object3D.position, object3D.rotation, object3D.scale);
  },

  /**
   * Handle button changes including axes, presses, touches, values.
   */
  updateButtons: function () {
    var buttonState;
    var id;
    var controller = this.controller;
    var gamepad;
    if (!controller || !controller.gamepad) { return; }

    gamepad = controller.gamepad;
    // Check every button.
    for (id = 0; id < gamepad.buttons.length; ++id) {
      // Initialize button state.
      if (!this.buttonStates[id]) {
        this.buttonStates[id] = {pressed: false, touched: false, value: 0};
      }
      if (!this.buttonEventDetails[id]) {
        this.buttonEventDetails[id] = {id: id, state: this.buttonStates[id]};
      }

      buttonState = gamepad.buttons[id];
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
    var controllerAxes = this.controller.gamepad.axes;
    var i;
    var previousAxis = this.axis;
    var changedAxes = this.changedAxes;

    // Check if axis changed.
    this.changedAxes.splice(0, this.changedAxes.length);
    for (i = 0; i < controllerAxes.length; ++i) {
      changedAxes.push(previousAxis[i] !== controllerAxes[i]);
      if (changedAxes[i]) { changed = true; }
    }
    if (!changed) { return false; }

    this.axis.splice(0, this.axis.length);
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
    this.el.emit(evtName, this.buttonEventDetails[id], false);
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
