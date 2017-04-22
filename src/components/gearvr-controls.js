var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var checkControllerPresentAndSetup = require('../utils/tracked-controls').checkControllerPresentAndSetup;
var emitIfAxesChanged = require('../utils/tracked-controls').emitIfAxesChanged;

var GEARVR_CONTROLLER_MODEL_BASE_URL = 'https://cdn.aframe.io/controllers/samsung/';
var GEARVR_CONTROLLER_MODEL_OBJ_URL = GEARVR_CONTROLLER_MODEL_BASE_URL + 'gear_vr_controller.obj';
var GEARVR_CONTROLLER_MODEL_OBJ_MTL = GEARVR_CONTROLLER_MODEL_BASE_URL + 'gear_vr_controller.mtl';

var GAMEPAD_ID_PREFIX = 'Gear VR';

/**
 * Vive Controls Component
 * Interfaces with vive controllers and maps Gamepad events to
 * common controller buttons: trackpad, trigger, grip, menu and system
 * It loads a controller model and highlights the pressed buttons
 */
module.exports.Component = registerComponent('gearvr-controls', {
  schema: {
    hand: {default: ''}, // This informs the degenerate arm model.
    buttonColor: {type: 'color', default: '#000000'},
    buttonTouchedColor: {type: 'color', default: '#777777'},
    buttonHighlightColor: {type: 'color', default: '#FFFFFF'},
    model: {default: true},
    rotationOffset: {default: 0} // use -999 as sentinel value to auto-determine based on hand
  },

  // buttonId
  // 0 - trackpad
  // 1 - triggeri
  mapping: {
    axes: {'trackpad': [0, 1]},
    buttons: ['trackpad', 'trigger']
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

    this.addControllersUpdateListener();
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('touchstart', this.onButtonTouchStart);
    el.removeEventListener('touchend', this.onButtonTouchEnd);
    el.removeEventListener('model-loaded', this.onModelLoaded);
    el.removeEventListener('axismove', this.onAxisMoved);

    this.removeControllersUpdateListener();
  },

  checkIfControllerPresent: function () {
    this.checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, this.data.hand ? {hand: this.data.hand} : {});
  },

  onGamepadConnectionEvent: function (evt) {
    this.checkIfControllerPresent();
  },

  play: function () {
    this.checkIfControllerPresent();
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    window.addEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
    this.addControllersUpdateListener();
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    window.removeEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;
    el.setAttribute('tracked-controls', {idPrefix: GAMEPAD_ID_PREFIX, rotationOffset: data.rotationOffset});
    if (!this.data.model) { return; }
    this.el.setAttribute('obj-model', {
      obj: GEARVR_CONTROLLER_MODEL_OBJ_URL,
      mtl: GEARVR_CONTROLLER_MODEL_OBJ_MTL
    });
  },

  addControllersUpdateListener: function () {
    this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  removeControllersUpdateListener: function () {
    this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  onControllersUpdate: function () {
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    this.checkIfControllerPresent();
  },

  // No need for onButtonChanged, since Gear VR controller has no analog buttons.

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;
    if (!this.data.model) { return; }
    buttonMeshes = this.buttonMeshes = {};
    buttonMeshes.trigger = controllerObject3D.getObjectByName('Trigger');
    buttonMeshes.trackpad = controllerObject3D.getObjectByName('Touchpad');
  },

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

  onAxisMoved: function (evt) { this.emitIfAxesChanged(this, this.mapping.axes, evt); },

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
