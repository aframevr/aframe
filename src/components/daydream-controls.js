var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var checkControllerPresentAndSetup = require('../utils/tracked-controls').checkControllerPresentAndSetup;
var emitIfAxesChanged = require('../utils/tracked-controls').emitIfAxesChanged;

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
    axes: {'trackpad': [0, 1]},
    buttons: ['trackpad', 'menu', 'system']
  },

  // Use these labels for detail on axis events such as thumbstickmoved.
  // e.g. for thumbstickmoved detail, the first axis returned is labeled x, and the second is labeled y.
  axisLabels: ['x', 'y', 'z', 'w'],

  bindMethods: function () {
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.removeControllersUpdateListener = bind(this.removeControllersUpdateListener, this);
    this.onAxisMoved = bind(this.onAxisMoved, this);
    this.onGamepadConnectionEvent = bind(this.onGamepadConnectionEvent, this);
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
    this.checkControllerPresentAndSetup = checkControllerPresentAndSetup; // to allow mock
    this.emitIfAxesChanged = emitIfAxesChanged; // to allow mock
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
    this.checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {hand: this.data.hand});
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

  onAxisMoved: function (evt) { this.emitIfAxesChanged(this, this.mapping.axes, evt); },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping.buttons[id];
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
