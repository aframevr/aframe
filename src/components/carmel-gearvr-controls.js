var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var getGamepadsByPrefix = require('../utils/tracked-controls').getGamepadsByPrefix;

var GAMEPAD_ID_PREFIX = 'Gear VR Touchpad';

/**
 * Vive Controls Component
 * Interfaces with vive controllers and maps Gamepad events to
 * common controller buttons: trackpad, trigger, grip, menu and system
 * It loads a controller model and highlights the pressed buttons
 */
module.exports.Component = registerComponent('carmel-gearvr-controls', {
  schema: {
    hand: {default: 'left'}
  },

  // buttonId
  // 0 - trackpad
  // 1 - trigger ( intensity value from 0.5 to 1 )
  // 2 - grip
  // 3 - menu ( dispatch but better for menu options )
  // 4 - system ( never dispatched on this layer )
  mapping: {
    axis0: 'trackpad',
    axis1: 'trackpad',
    button0: 'trackpad'
  },

  bindMethods: function () {
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.onGamepadConnected = bind(this.onGamepadConnected, this);
    this.onGamepadDisconnected = bind(this.onGamepadDisconnected, this);
  },

  init: function () {
    this.buttonStates = {};
    this.previousAxis = [];
    this.animationActive = 'pointing';
    this.controllerPresent = false;
    this.bindMethods();
    this.getGamepadsByPrefix = getGamepadsByPrefix; // to allow mock
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
    // var data = this.data;
    // The 'Gear VR Touchpad' gamepad exposed by Carmel has no pose,
    // so it won't show up in the tracked-controls system controllers.
    var gamepads = this.getGamepadsByPrefix(GAMEPAD_ID_PREFIX);
    var isPresent = gamepads && gamepads.length > 0;
    // we need up to update the controller state ourselves
    if (isPresent) { this.controller = gamepads[0]; }
    if (isPresent === this.controllerPresent) { return; }
    this.controllerPresent = isPresent;
    if (isPresent) {
      this.el.setAttribute('look-controls', '');
      this.addEventListeners();
    } else {
      this.el.removeAttribute('look-controls');
      this.removeEventListeners();
    }
  },

  tick: function () {
    // The 'Gear VR Touchpad' gamepad exposed by Carmel has no pose,
    // so it won't show up in the tracked-controls system controllers.
    // Therefore, we have to do tick processing for the Gear VR Touchpad ourselves.
    this.checkIfControllerPresent();
    // we don't need to update the pose since we inject look-controls
    this.updateButtons();
  },

  updateButtons: function () {
    var i;
    var buttonState;
    var controller = this.controller;
    if (!this.controller) { return; }
    for (i = 0; i < controller.buttons.length; ++i) {
      buttonState = controller.buttons[i];
      this.handleButton(i, buttonState);
    }
    this.handleAxes(controller.axes);
  },

  handleAxes: function (controllerAxes) {
    var previousAxis = this.previousAxis;
    var changed = false;
    var i;
    for (i = 0; i < controllerAxes.length; ++i) {
      if (previousAxis[i] !== controllerAxes[i]) {
        changed = true;
        break;
      }
    }
    if (!changed) { return; }
    this.previousAxis = controllerAxes.slice();
    console.log('axismove ' + this.previousAxis);
    this.el.emit('axismove', { axis: this.previousAxis });
  },

  handleButton: function (id, buttonState) {
    var changed = false;
    changed = changed || this.handlePress(id, buttonState);
    changed = changed || this.handleTouch(id, buttonState);
    changed = changed || this.handleValue(id, buttonState);
    if (!changed) { return; }
    console.log('buttonchanged ' + id + ' ' + JSON.stringify(buttonState));
    this.el.emit('buttonchanged', { id: id, state: buttonState });
  },

  handlePress: function (id, buttonState) {
    var buttonStates = this.buttonStates;
    var evtName = buttonState.pressed ? 'down' : 'up';
    var previousButtonState = buttonStates[id] = buttonStates[id] || {};
    if (buttonState.pressed === previousButtonState.pressed) { return false; }
    this.onButtonEvent(id, evtName);
    previousButtonState.pressed = buttonState.pressed;
    return true;
  },

  handleTouch: function (id, buttonState) {
    var buttonStates = this.buttonStates;
    var evtName = buttonState.touched ? 'start' : 'end';
    var previousButtonState = buttonStates[id] = buttonStates[id] || {};
    if (buttonState.touched === previousButtonState.touched) { return false; }
    previousButtonState.touched = buttonState.touched;
    this.onButtonEvent(id, 'touch' + evtName);
    return true;
  },

  handleValue: function (id, buttonState) {
    var buttonStates = this.buttonStates;
    var previousButtonState = buttonStates[id] = buttonStates[id] || {};
    if (buttonState.value === previousButtonState.value) { return false; }
    previousButtonState.value = buttonState.value;
    return true;
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
  },

  pause: function () {
    window.removeEventListener('gamepadconnected', this.onGamepadConnected, false);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected, false);
    this.removeEventListeners();
  },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping['button' + id];
    var i;
    if (Array.isArray(buttonName)) {
      for (i = 0; i < buttonName.length; i++) {
        console.log('buttonEvent ' + buttonName[i] + evtName);
        this.el.emit(buttonName[i] + evtName);
      }
    } else {
      console.log('buttonEvent ' + buttonName + evtName);
      this.el.emit(buttonName + evtName);
    }
  }
});
