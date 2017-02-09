var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var isControllerPresent = require('../utils/tracked-controls').isControllerPresent;

var VIVE_CONTROLLER_MODEL_OBJ_URL = 'https://cdn.aframe.io/controllers/vive/vr_controller_vive.obj';
var VIVE_CONTROLLER_MODEL_OBJ_MTL = 'https://cdn.aframe.io/controllers/vive/vr_controller_vive.mtl';

var GAMEPAD_ID_PREFIX = 'OpenVR ';

/**
 * Vive Controls Component
 * Interfaces with vive controllers and maps Gamepad events to
 * common controller buttons: trackpad, trigger, grip, menu and system
 * It loads a controller model and highlights the pressed buttons
 */
module.exports.Component = registerComponent('vive-controls', {
  schema: {
    hand: {default: 'left'},
    buttonColor: {type: 'color', default: '#FAFAFA'},  // Off-white.
    buttonHighlightColor: {type: 'color', default: '#22D1EE'},  // Light blue.
    model: {default: true},
    rotationOffset: {default: 0} // use -999 as sentinel value to auto-determine based on hand
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
    button0: 'trackpad',
    button1: 'trigger',
    button2: 'grip',
    button3: 'menu',
    button4: 'system'
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
    var controller = data.hand === 'right' ? 0 : data.hand === 'left' ? 1 : 2;
    var isPresent = this.isControllerPresent(this.el.sceneEl, GAMEPAD_ID_PREFIX, { index: controller });
    if (isPresent === this.controllerPresent) { return; }
    this.controllerPresent = isPresent;
    if (isPresent) { this.injectTrackedControls(); } // inject track-controls
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
    this.addEventListeners();
  },

  pause: function () {
    window.removeEventListener('gamepadconnected', this.onGamepadConnected, false);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected, false);
    this.removeControllersUpdateListener();
    this.removeEventListeners();
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;
    // handId: 0 - right, 1 - left, 2 - anything else...
    var controller = data.hand === 'right' ? 0 : data.hand === 'left' ? 1 : 2;
    // if we have an OpenVR Gamepad, use the fixed mapping
    el.setAttribute('tracked-controls', {idPrefix: GAMEPAD_ID_PREFIX, controller: controller, rotationOffset: data.rotationOffset});
    if (!this.data.model) { return; }
    this.el.setAttribute('obj-model', {
      obj: VIVE_CONTROLLER_MODEL_OBJ_URL,
      mtl: VIVE_CONTROLLER_MODEL_OBJ_MTL
    });
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

  onButtonChanged: function (evt) {
    var button = this.mapping['button' + evt.detail.id];
    var buttonMeshes = this.buttonMeshes;
    var value;
    if (!button || !buttonMeshes || button !== 'trigger') { return; }
    value = evt.detail.state.value;
    buttonMeshes.trigger.rotation.x = -value * (Math.PI / 12);
  },

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;
    if (!this.data.model) { return; }
    buttonMeshes = this.buttonMeshes = {};
    buttonMeshes.grip = {
      left: controllerObject3D.getObjectByName('leftgrip'),
      right: controllerObject3D.getObjectByName('rightgrip')
    };
    buttonMeshes.menu = controllerObject3D.getObjectByName('menubutton');
    buttonMeshes.system = controllerObject3D.getObjectByName('systembutton');
    buttonMeshes.trackpad = controllerObject3D.getObjectByName('touchpad');
    buttonMeshes.trigger = controllerObject3D.getObjectByName('trigger');
    // Offset pivot point
    controllerObject3D.position.set(0, -0.015, 0.04);
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
    this.updateModel(buttonName, evtName);
  },

  updateModel: function (buttonName, evtName) {
    var i;
    if (!this.data.model) { return; }
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
    if (!buttonMeshes) { return; }
    if (buttonName === 'grip') {
      buttonMeshes.grip.left.material.color.set(color);
      buttonMeshes.grip.right.material.color.set(color);
      return;
    }
    buttonMeshes[buttonName].material.color.set(color);
  }
});
