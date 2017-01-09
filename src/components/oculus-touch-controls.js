var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var isControllerPresent = require('../utils/tracked-controls').isControllerPresent;

var TOUCH_CONTROLLER_MODEL_BASE_URL = 'https://cdn.aframe.io/controllers/oculus/vr_controller_oculus_touch_';
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
    buttonColor: {default: '#FAFAFA'},          // Off-white.
    buttonHighlightColor: {default: '#22D1EE'}, // Light blue.
    model: {default: true},
    rotationOffset: {default: 0} // no default offset; -999 is sentinel value to auto-determine based on hand
  },

  // buttonId
  // 0 - thumbstick
  // 1 - trigger ( intensity value from 0.5 to 1 )
  // 2 - grip
  // 3 - menu ( dispatch but better for menu options )
  // 4 - system ( never dispatched on this layer )
  mapping: {
    'left': {
      axis0: 'thumbstick',
      axis1: 'thumbstick',
      button0: 'thumbstick',
      button1: 'trigger',
      button2: 'grip',
      button3: 'X',
      button4: 'Y',
      button5: 'surface'
    },
    'right': {
      axis0: 'thumbstick',
      axis1: 'thumbstick',
      button0: 'thumbstick',
      button1: 'trigger',
      button2: 'grip',
      button3: 'A',
      button4: 'B',
      button5: 'surface'
    }
  },

  bindMethods: function () {
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.removeControllersUpdateListener = bind(this.removeControllersUpdateListener, this);
    this.onGamepadConnected = bind(this.onGamepadConnected, this);
    this.onGamepadDisconnected = bind(this.onGamepadDisconnected, this);
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
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('model-loaded', this.onModelLoaded);
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('buttonchanged', this.onButtonChanged);
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('touchstart', this.onButtonTouchStart);
    el.removeEventListener('touchend', this.onButtonTouchEnd);
    el.removeEventListener('model-loaded', this.onModelLoaded);
  },

  checkIfControllerPresent: function () {
    var data = this.data;
    var isPresent = this.isControllerPresent(this.el.sceneEl, GAMEPAD_ID_PREFIX, { hand: data.hand });
    if (isPresent === this.controllerPresent) { return; }
    this.controllerPresent = isPresent;
    if (isPresent) {
      this.injectTrackedControls(); // inject track-controls
      this.addEventListeners();
    } else {
      this.removeEventListeners();
    }
  },

  onGamepadConnected: function (evt) {
    // for now, don't disable controller update listening, due to
    // apparent issue with FF Nightly only sending one event and seeing one controller;
    // this.everGotGamepadEvent = true;
    // this.removeControllersUpdateListener();
    this.checkIfControllerPresent();
  },

  onGamepadDisconnected: function (evt) {
    // for now, don't disable controller update listening, due to
    // apparent issue with FF Nightly only sending one event and seeing one controller;
    // this.everGotGamepadEvent = true;
    // this.removeControllersUpdateListener();
    this.checkIfControllerPresent();
  },

  play: function () {
    this.checkIfControllerPresent();
    window.addEventListener('gamepadconnected', this.onGamepadConnected, false);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected, false);
    this.addControllersUpdateListener();
  },

  pause: function () {
    window.removeEventListener('gamepadconnected', this.onGamepadConnected, false);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected, false);
    this.removeControllersUpdateListener();
    this.removeEventListeners();
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

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;
    var isRightHand = data.hand === 'right';

    // since each hand is named differently, avoid enumeration
    el.setAttribute('tracked-controls', {
      id: isRightHand ? 'Oculus Touch (Right)' : 'Oculus Touch (Left)',
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
    if (!this.everGotGamepadEvent) { this.checkIfControllerPresent(); }
  },

  // currently, browser bugs prevent capacitive touch events from firing on trigger and grip;
  // however those have analog values, and this (below button-down values) can be used to fake them
  isEmulatedTouchEvent: function (analogValue) {
    return analogValue && (analogValue >= EMULATED_TOUCH_THRESHOLD);
  },

  onButtonChanged: function (evt) {
    var button = this.mapping[this.data.hand]['button' + evt.detail.id];
    var buttonMeshes = this.buttonMeshes;
    var isPreviousValueEmulatedTouch;
    var analogValue;
    var isEmulatedTouch;

    // at the moment, if trigger or grip,
    // touch events aren't happening (touched is stuck true);
    // synthesize touch events from very low analog values
    if (button !== 'trigger' && button !== 'grip') { return; }
    analogValue = evt.detail.state.value;
    isPreviousValueEmulatedTouch = this.isEmulatedTouchEvent(this.previousButtonValues[button]);
    this.previousButtonValues[button] = analogValue;
    isEmulatedTouch = this.isEmulatedTouchEvent(analogValue);
    if (isEmulatedTouch !== isPreviousValueEmulatedTouch) {
      (isEmulatedTouch ? this.onButtonTouchStart : this.onButtonTouchEnd)(evt);
    }
    if (button !== 'trigger' || !buttonMeshes || !buttonMeshes.trigger) { return; }
    buttonMeshes.trigger.rotation.x = -analogValue * (Math.PI / 12);
  },

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;
    if (!this.data.model) { return; }

    var leftHand = this.data.hand === 'left';
    buttonMeshes = this.buttonMeshes = {};

    buttonMeshes.grip = controllerObject3D.getObjectByName(leftHand ? 'grip tooche1 group3' : 'grip tooche group4');
    buttonMeshes.thumbstick = controllerObject3D.getObjectByName(leftHand ? 'tooche1 group3 control_surface group2 thumb_stick' : 'tooche group4 control_surface group2 thumb_stick');
    buttonMeshes.trigger = controllerObject3D.getObjectByName(leftHand ? 'tooche1 group3 trigger' : 'tooche group4 trigger');
    buttonMeshes['X'] = controllerObject3D.getObjectByName('tooche1 group3 control_surface group2 button2');
    buttonMeshes['A'] = controllerObject3D.getObjectByName('tooche group4 control_surface group2 button2');
    buttonMeshes['Y'] = controllerObject3D.getObjectByName('tooche1 group3 control_surface group2 button3');
    buttonMeshes['B'] = controllerObject3D.getObjectByName('tooche group4 control_surface group2 button3');
    buttonMeshes.surface = controllerObject3D.getObjectByName(leftHand ? 'tooche1 group3 face control_surface group2' : 'tooche group4 face control_surface group2');

    // Offset pivot point
    controllerObject3D.position = PIVOT_OFFSET;
  },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping[this.data.hand]['button' + id];
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
    var color = state === 'up' ? this.data.buttonColor : this.data.buttonHighlightColor;
    var buttonMeshes = this.buttonMeshes;
    if (!this.data.model) { return; }
    if (buttonMeshes && buttonMeshes[buttonName]) {
      buttonMeshes[buttonName].material.color.set(color);
    }
  }
});
