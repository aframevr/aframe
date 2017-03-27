var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var isControllerPresent = require('../utils/tracked-controls').isControllerPresent;
var getGamepadsByPrefix = require('../utils/tracked-controls').getGamepadsByPrefix;

var TOUCH_CONTROLLER_MODEL_BASE_URL = 'https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-';
var TOUCH_CONTROLLER_MODEL_OBJ_URL_L = TOUCH_CONTROLLER_MODEL_BASE_URL + 'left.obj';
var TOUCH_CONTROLLER_MODEL_OBJ_MTL_L = TOUCH_CONTROLLER_MODEL_BASE_URL + 'left.mtl';
var TOUCH_CONTROLLER_MODEL_OBJ_URL_R = TOUCH_CONTROLLER_MODEL_BASE_URL + 'right.obj';
var TOUCH_CONTROLLER_MODEL_OBJ_MTL_R = TOUCH_CONTROLLER_MODEL_BASE_URL + 'right.mtl';

var GAMEPAD_ID_PREFIX = 'Oculus Touch';

var PIVOT_OFFSET = {x: 0, y: -0.015, z: 0.04};

// currently, browser bugs prevent capacitive touch events from firing on trigger and grip;
// however those have analog values, and this (below button-down values) can be used to fake them
var EMULATED_TOUCH_THRESHOLD = 0.001;

/**
 * Oculus Touch Controls Component
 * Interfaces with Oculus Touch controllers and maps Gamepad events to
 * common controller buttons: trackpad, trigger, grip, menu and system
 * It loads a controller model and highlights the pressed buttons
 */
module.exports.Component = registerComponent('oculus-touch-controls', {
  schema: {
    hand: {default: 'left'},
    buttonColor: {type: 'color', default: '#999'},          // Off-white.
    buttonTouchColor: {type: 'color', default: '#8AB'},
    buttonHighlightColor: {type: 'color', default: '#2DF'}, // Light blue.
    model: {default: true},
    rotationOffset: {default: 0} // no default offset; -999 is sentinel value to auto-determine based on hand
  },

  // buttonId
  // 0 - thumbstick (which has separate axismove / thumbstickmoved events)
  // 1 - trigger (with analog value, which goes up to 1)
  // 2 - grip (with analog value, which goes up to 1)
  // 3 - X (left) or A (right)
  // 4 - Y (left) or B (right)
  // 5 - surface (touch only)
  mapping: {
    'left': {
      axes: {'thumbstick': [0, 1]},
      buttons: ['thumbstick', 'trigger', 'grip', 'xbutton', 'ybutton', 'surface']
    },
    'right': {
      axes: {'thumbstick': [0, 1]},
      buttons: ['thumbstick', 'trigger', 'grip', 'abutton', 'abutton', 'surface']
    }
  },

  // Use these labels for detail on axis events such as thumbstickmoved.
  // e.g. for thumbstickmoved detail, the first axis returned is labeled x, and the second is labeled y.
  axisLabels: ['x', 'y', 'z', 'w'],

  bindMethods: function () {
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.onAxisMoved = bind(this.onAxisMoved, this);
    this.onGamepadConnectionEvent = bind(this.onGamepadConnectionEvent, this);
  },

  init: function () {
    var self = this;
    this.animationActive = 'pointing';
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { self.onButtonEvent(evt.detail.id, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt.detail.id, 'up'); };
    this.onButtonTouchStart = function (evt) { self.onButtonEvent(evt.detail.id, 'touchstart'); };
    this.onButtonTouchEnd = function (evt) { self.onButtonEvent(evt.detail.id, 'touchend'); };
    this.controllerPresent = false;
    this.everGotGamepadEvent = false;
    this.lastControllerCheck = 0;
    this.previousButtonValues = {};
    this.bindMethods();
    this.isControllerPresent = isControllerPresent; // to allow mock
    this.getGamepadsByPrefix = getGamepadsByPrefix; // to allow mock
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('axismove', this.onAxisMoved);
    el.addEventListener('model-loaded', this.onModelLoaded);
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('buttonchanged', this.onButtonChanged);
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('touchstart', this.onButtonTouchStart);
    el.removeEventListener('touchend', this.onButtonTouchEnd);
    el.removeEventListener('axismove', this.onAxisMoved);
    el.removeEventListener('model-loaded', this.onModelLoaded);
  },

  checkIfControllerPresent: function () {
    var data = this.data;
    var isPresent = false;
    // Find which controller matches both prefix and hand.
    var whichControllers = (this.getGamepadsByPrefix(GAMEPAD_ID_PREFIX) || [])
      .filter(function (gamepad) { return gamepad.hand === data.hand; });
    if (whichControllers && whichControllers.length) { isPresent = true; }
    if (isPresent === this.controllerPresent) { return; }
    this.controllerPresent = isPresent;
    if (isPresent) {
      // Inject with specific gamepad id, if provided. This works around a temporary issue
      // where Chromium uses `Oculus Touch (Right)` but Firefox uses `Oculus Touch (right)`.
      this.injectTrackedControls(whichControllers[0]);
      this.addEventListeners();
    } else { this.removeEventListeners(); }
  },

  onGamepadConnectionEvent: function (evt) {
    this.everGotGamepadEvent = true;
    // Due to an apparent bug in FF Nightly
    // where only one gamepadconnected / disconnected event is fired,
    // which makes it difficult to handle in individual controller entities,
    // we no longer remove the controllersupdate listener as a result.
    this.checkIfControllerPresent();
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
    window.addEventListener('gamepadconnected', this.onGamepadConnectionEvent, false);
    window.addEventListener('gamepaddisconnected', this.onGamepadConnectionEvent, false);
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
    window.removeEventListener('gamepadconnected', this.onGamepadConnectionEvent, false);
    window.removeEventListener('gamepaddisconnected', this.onGamepadConnectionEvent, false);
  },

  updateControllerModel: function () {
    var objUrl, mtlUrl;
    if (!this.data.model) { return; }
    if (this.data.hand === 'right') {
      objUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_URL_R + ')';
      mtlUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_MTL_R + ')';
    } else {
      objUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_URL_L + ')';
      mtlUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_MTL_L + ')';
    }
    this.el.setAttribute('obj-model', {obj: objUrl, mtl: mtlUrl});
  },

  injectTrackedControls: function (gamepad) {
    var el = this.el;
    var data = this.data;
    var isRightHand = data.hand === 'right';
    // Inject with specific gamepad id, if provided. This works around a temporary issue
    // where Chromium uses `Oculus Touch (Right)` but Firefox uses `Oculus Touch (right)`.
    el.setAttribute('tracked-controls', {
      id: gamepad ? gamepad.id : isRightHand ? 'Oculus Touch (Right)' : 'Oculus Touch (Left)',
      controller: 0,
      rotationOffset: data.rotationOffset !== -999 ? data.rotationOffset : isRightHand ? -90 : 90
    });
    this.updateControllerModel();
  },

  addControllersUpdateListener: function () {
    this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  removeControllersUpdateListener: function () {
    this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  onControllersUpdate: function () {
    // Due to an apparent bug in FF Nightly
    // where only one gamepadconnected / disconnected event is fired,
    // which makes it difficult to handle in individual controller entities,
    // we no longer remove the controllersupdate listener when we get a gamepad event.
    this.checkIfControllerPresent();
  },

  // Currently, browser bugs prevent capacitive touch events from firing on trigger and grip;
  // however those have analog values, and this (below button-down values) can be used to fake them.
  isEmulatedTouchEvent: function (analogValue) {
    return analogValue && (analogValue >= EMULATED_TOUCH_THRESHOLD);
  },

  onButtonChanged: function (evt) {
    var button = this.mapping[this.data.hand].buttons[evt.detail.id];
    var buttonMeshes = this.buttonMeshes;
    var isPreviousValueEmulatedTouch;
    var analogValue;
    var isEmulatedTouch;

    if (!button) { return; }

    if (button === 'trigger' || button === 'grip') {
      // At the moment, if trigger or grip,
      // touch events aren't happening (touched is stuck true);
      // synthesize touch events from very low analog values.
      analogValue = evt.detail.state.value;
      isPreviousValueEmulatedTouch = this.isEmulatedTouchEvent(this.previousButtonValues[button]);
      this.previousButtonValues[button] = analogValue;
      isEmulatedTouch = this.isEmulatedTouchEvent(analogValue);
      if (isEmulatedTouch !== isPreviousValueEmulatedTouch) {
        (isEmulatedTouch ? this.onButtonTouchStart : this.onButtonTouchEnd)(evt);
      }
    }

    // Update trigger and/or grip meshes, if any.
    if (buttonMeshes) {
      if (button === 'trigger' && buttonMeshes.trigger) {
        buttonMeshes.trigger.rotation.x = -analogValue * (Math.PI / 24);
      }
      if (button === 'grip' && buttonMeshes.grip) {
        buttonMeshes.grip.rotation.y = (this.data.hand === 'left' ? -1 : 1) * analogValue * (Math.PI / 60);
      }
    }

    // Pass along changed event with button state, using the buttom mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;
    if (!this.data.model) { return; }

    var leftHand = this.data.hand === 'left';
    buttonMeshes = this.buttonMeshes = {};

    buttonMeshes.grip = controllerObject3D.getObjectByName(leftHand ? 'buttonHand_oculus-touch-controller-left.004' : 'buttonHand_oculus-touch-controller-right.005');
    buttonMeshes.thumbstick = controllerObject3D.getObjectByName(leftHand ? 'stick_oculus-touch-controller-left.007' : 'stick_oculus-touch-controller-right.004');
    buttonMeshes.trigger = controllerObject3D.getObjectByName(leftHand ? 'buttonTrigger_oculus-touch-controller-left.005' : 'buttonTrigger_oculus-touch-controller-right.006');
    buttonMeshes.xbutton = controllerObject3D.getObjectByName('buttonX_oculus-touch-controller-left.002');
    buttonMeshes.abutton = controllerObject3D.getObjectByName('buttonA_oculus-touch-controller-right.002');
    buttonMeshes.ybutton = controllerObject3D.getObjectByName('buttonY_oculus-touch-controller-left.001');
    buttonMeshes.bbutton = controllerObject3D.getObjectByName('buttonB_oculus-touch-controller-right.003');

    // Offset pivot point
    controllerObject3D.position = PIVOT_OFFSET;
  },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping[this.data.hand].buttons[id];
    var i;
    if (Array.isArray(buttonName)) {
      for (i = 0; i < buttonName.length; i++) {
        this.el.emit(buttonName[i] + evtName);
      }
    } else {
      this.el.emit(buttonName + evtName);
    }
    this.updateModel(buttonName, evtName);
  },

  onAxisMoved: function (evt) {
    var self = this;
    var axesMapping = this.mapping[this.data.hand].axes;
    // In theory, it might be better to use mapping from axis to control.
    // In practice, it is not clear whether the additional overhead is worthwhile,
    // and if we did grouping of axes, we really need de-duplication there.
    Object.keys(axesMapping).forEach(function (key) {
      var value = axesMapping[key];
      var detail = {};
      var changed = !evt.detail.changed;
      if (!changed) { value.forEach(function (axisNumber) { changed |= evt.detail.changed[axisNumber]; }); }
      if (changed) {
        value.forEach(function (axisNumber) { detail[self.axisLabels[axisNumber]] = evt.detail.axis[axisNumber]; });
        self.el.emit(key + 'moved', detail);
        // If we updated the model based on axis values, that call would go here.
      }
    });
  },

  updateModel: function (buttonName, evtName) {
    var i;
    if (Array.isArray(buttonName)) {
      for (i = 0; i < buttonName.length; i++) {
        this.updateButtonModel(buttonName[i], evtName);
      }
    } else {
      this.updateButtonModel(buttonName, evtName);
    }
  },

  updateButtonModel: function (buttonName, state) {
    var color = (state === 'up' || state === 'touchend') ? this.data.buttonColor : state === 'touchstart' ? this.data.buttonTouchColor : this.data.buttonHighlightColor;
    var buttonMeshes = this.buttonMeshes;
    if (!this.data.model) { return; }
    if (buttonMeshes && buttonMeshes[buttonName]) {
      buttonMeshes[buttonName].material.color.set(color);
    }
  }
});
