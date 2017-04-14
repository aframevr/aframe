var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var isControllerPresent = require('../utils/tracked-controls').isControllerPresent;

var DAYDREAM_CONTROLLER_MODEL_BASE_URL = 'https://cdn.aframe.io/controllers/google/';
var DAYDREAM_CONTROLLER_MODEL_OBJ_URL = DAYDREAM_CONTROLLER_MODEL_BASE_URL + 'vr_controller_daydream.obj';
var DAYDREAM_CONTROLLER_MODEL_OBJ_MTL = DAYDREAM_CONTROLLER_MODEL_BASE_URL + 'vr_controller_daydream.mtl';

var GAMEPAD_ID_PREFIX = 'Daydream Controller';

/**
 * Daydream controls.
 */
module.exports.Component = registerComponent('daydream-controls', {
  schema: {
    hand: {default: ''},  // Informs the degenerate arm model.
    buttonColor: {type: 'color', default: '#000000'},
    buttonTouchedColor: {type: 'color', default: '#777777'},
    buttonHighlightColor: {type: 'color', default: '#FFFFFF'},
    model: {default: true},
    // Use -999 as sentinel value to auto-determine based on hand.
    rotationOffset: {default: 0}
  },

  // buttonId
  // 0 - trackpad
  // 1 - menu (never dispatched on this layer)
  // 2 - system (never dispatched on this layer)
  mapping: {
    axis0: 'trackpad',
    axis1: 'trackpad',
    button0: 'trackpad',
    button1: 'menu',
    button2: 'system'
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
    this.onButtonDown = function (evt) { self.onButtonEvent(evt.detail.id, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt.detail.id, 'up'); };
    this.onButtonTouchStart = function (evt) { self.onButtonEvent(evt.detail.id, 'touchstart'); };
    this.onButtonTouchEnd = function (evt) { self.onButtonEvent(evt.detail.id, 'touchend'); };
    this.onAxisMoved = bind(this.onAxisMoved, this);
    this.controllerPresent = false;
    this.everGotGamepadEvent = false;
    this.lastControllerCheck = 0;
    this.bindMethods();
    this.isControllerPresent = isControllerPresent; // to allow mock
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('model-loaded', this.onModelLoaded);
    el.addEventListener('axismove', this.onAxisMoved);
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('touchstart', this.onButtonTouchStart);
    el.removeEventListener('touchend', this.onButtonTouchEnd);
    el.removeEventListener('model-loaded', this.onModelLoaded);
    el.removeEventListener('axismove', this.onAxisMoved);
  },

  checkIfControllerPresent: function () {
    var isPresent = this.isControllerPresent(this.el.sceneEl, GAMEPAD_ID_PREFIX, {hand: this.data.hand});
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
    el.setAttribute('tracked-controls', {idPrefix: GAMEPAD_ID_PREFIX, hand: data.hand, rotationOffset: data.rotationOffset});
    if (!this.data.model) { return; }
    this.el.setAttribute('obj-model', {
      obj: DAYDREAM_CONTROLLER_MODEL_OBJ_URL,
      mtl: DAYDREAM_CONTROLLER_MODEL_OBJ_MTL
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

  // No need for onButtonChanged, since Daydream controller has no analog buttons.

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;
    if (!this.data.model) { return; }
    buttonMeshes = this.buttonMeshes = {};
    buttonMeshes.menu = controllerObject3D.getObjectByName('AppButton_AppButton_Cylinder.004');
    buttonMeshes.system = controllerObject3D.getObjectByName('HomeButton_HomeButton_Cylinder.005');
    buttonMeshes.trackpad = controllerObject3D.getObjectByName('TouchPad_TouchPad_Cylinder.003');
    // Offset pivot point
    controllerObject3D.position.set(0, 0, -0.04);
  },

  onAxisMoved: function (evt) {
    if (evt.detail.axis[0] === 0 && evt.detail.axis[1] === 0) { return; }
    this.el.emit('trackpadmoved', { x: evt.detail.axis[0], y: evt.detail.axis[1] });
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
    var buttonMeshes = this.buttonMeshes;
    if (!buttonMeshes || !buttonMeshes[buttonName]) { return; }
    var color;
    switch (state) {
      case 'down':
        color = this.data.buttonHighlightColor;
        break;
      case 'touchstart':
        color = this.data.buttonTouchedColor;
        break;
      default:
        color = this.data.buttonColor;
    }
    buttonMeshes[buttonName].material.color.set(color);
  }
});
