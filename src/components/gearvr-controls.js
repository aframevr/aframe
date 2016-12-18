var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var getGamepadsByPrefix = require('../utils/tracked-controls').getGamepadsByPrefix;
var THREE = require('../lib/three');

var GAMEPAD_ID_PREFIX = 'Gear VR Touchpad';

/**
 * GearVR Controls Component
 * Interfaces with Gear VR touchpad.  For Carmel browser, it maps
 * Gamepad events to common controller button (trackpad) and axes.
 * For Samsung Internet GearVR browser, it uses mouse and touch events
 * to simulate appropriate Gamepad behavior.
 */
module.exports.Component = registerComponent('gearvr-controls', {
  // since aframe-teleport-controls looks for tracked-controls, add one
  dependencies: ['tracked-controls'],

  schema: {
    hand: {default: 'right'},
    model: {default: 'false'},
    rotationOffset: {default: 0}
  },

  // buttonId
  // 0 - trackpad
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
    this.onTouchStart = bind(this.onTouchStart, this);
    this.onMouseMove = bind(this.onMouseMove, this);
    this.onTouchEnd = bind(this.onTouchEnd, this);
  },

  init: function () {
    this.buttonStates = {};
    this.previousAxis = [];
    this.animationActive = 'pointing';
    this.controllerPresent = false;
    this.bindMethods();
    this.getGamepadsByPrefix = getGamepadsByPrefix; // to allow mock
    // check whether we need to emulate Gamepad for Samsung Internet browser
    this.isSamsungInternetBrowser = navigator.userAgent.indexOf(' SamsungBrowser/') >= 0;
    if (this.isSamsungInternetBrowser) {
      this.controller = this.fauxController = {buttons: [{pressed: false}], axes: [0, 0]};
    }
  },

  onTouchStart: function () { this.fauxController.buttons[0].pressed = true; },
  onTouchEnd: function () { this.fauxController.buttons[0].pressed = false; },
  onMouseMove: function (evt) {
    this.fauxController.axes[0] = 2 * evt.screenX / window.screen.width - 1;
    this.fauxController.axes[1] = 2 * evt.screenY / window.screen.height - 1;
  },

  addControllerAttributes: function () {
    this.el.setAttribute('look-controls', '');
    if (this.isSamsungInternetBrowser) {
      window.addEventListener('touchstart', this.onTouchStart, false);
      window.addEventListener('mousemove', this.onMouseMove, false);
      window.addEventListener('touchend', this.onTouchEnd, false);
    }
  },

  removeControllerAttributes: function () {
    this.el.removeAttribute('look-controls');
    if (this.isSamsungInternetBrowser) {
      window.removeEventListener('touchstart', this.onTouchStart, false);
      window.removeEventListener('mousemove', this.onMouseMove, false);
      window.removeEventListener('touchend', this.onTouchEnd, false);
    }
  },

  getControllerIfPresent: function () {
    // The 'Gear VR Touchpad' gamepad exposed by Carmel has no pose,
    // so it won't show up in the tracked-controls system controllers.
    var gamepads = this.getGamepadsByPrefix(GAMEPAD_ID_PREFIX);
    if (!gamepads || !gamepads.length) { return undefined; }
    return gamepads[0];
  },

  checkIfControllerPresent: function () {
    var controller = this.getControllerIfPresent();
    var isPresent = !(!controller); // coerce to boolean for matching purposes
    if (controller) { this.controller = controller; }
    if (this.isSamsungInternetBrowser) { isPresent = true; }
    if (isPresent === this.controllerPresent) { return; }
    this.controllerPresent = isPresent;
    if (isPresent) {
      this.addControllerAttributes();
    } else {
      this.removeControllerAttributes();
    }
  },

  tick: function () {
    // The 'Gear VR Touchpad' gamepad exposed by Carmel has no pose,
    // so it won't show up in the tracked-controls system controllers.
    // Therefore, we have to do tick processing for the Gear VR Touchpad ourselves.
    this.checkIfControllerPresent();
    // offset the hand position so it's not on the ground
    var offset = new THREE.Vector3(this.data.hand === 'left' ? -0.15 : 0.15, 1.25, -0.15);
    // look-controls and/or tracked-controls computed position and rotation before we get here
    // so rotate the offset in the right direction and add it
    offset.applyAxisAngle(this.el.object3D.up, this.el.object3D.rotation.y);
    this.el.object3D.position.add(offset);
    // apply the model rotation, since tracked-controls can't do it for us
    this.el.object3D.rotation.z += this.data.rotationOffset;
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
    this.el.emit('axismove', { axis: this.previousAxis });
  },

  handleButton: function (id, buttonState) {
    var changed = false;
    changed = changed || this.handlePress(id, buttonState);
    changed = changed || this.handleTouch(id, buttonState);
    changed = changed || this.handleValue(id, buttonState);
    if (!changed) { return; }
    this.el.emit('buttonchanged', { id: id, state: buttonState });
  },

  handlePress: function (id, buttonState) {
    var buttonStates = this.buttonStates;
    var previousButtonState = buttonStates[id] = buttonStates[id] || {};
    var pressed = buttonState.pressed;
    // as workaround for Carmel deferring button down event until button up,
    // if non-zero axis (which requires holding finger on touchpad), treat as down
    var previousAxis = this.previousAxis;
    if (!this.isSamsungInternetBrowser &&
      previousAxis && (previousAxis.length > 1) && (previousAxis[0] || previousAxis[1])) { pressed = true; }
    if (pressed === previousButtonState.pressed) { return false; }
    this.onButtonEvent(id, pressed ? 'down' : 'up');
    previousButtonState.pressed = pressed;
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
    this.checkIfControllerPresent();
  },

  onGamepadDisconnected: function (evt) {
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
    this.removeControllerAttributes();
  },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping['button' + id];
    var i;
    if (Array.isArray(buttonName)) {
      for (i = 0; i < buttonName.length; i++) {
        this.el.emit(buttonName[i] + evtName);
      }
    } else {
      this.el.emit(buttonName + evtName);
    }
  }
});
