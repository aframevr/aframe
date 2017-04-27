var bind = require('../utils/bind');
var registerComponent = require('../core/component').registerComponent;
var controllerUtils = require('../utils/tracked-controls');

var TOUCH_CONTROLLER_MODEL_BASE_URL = 'https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-';
var TOUCH_CONTROLLER_MODEL_OBJ_URL_L = TOUCH_CONTROLLER_MODEL_BASE_URL + 'left.obj';
var TOUCH_CONTROLLER_MODEL_OBJ_MTL_L = TOUCH_CONTROLLER_MODEL_BASE_URL + 'left.mtl';
var TOUCH_CONTROLLER_MODEL_OBJ_URL_R = TOUCH_CONTROLLER_MODEL_BASE_URL + 'right.obj';
var TOUCH_CONTROLLER_MODEL_OBJ_MTL_R = TOUCH_CONTROLLER_MODEL_BASE_URL + 'right.mtl';

var GAMEPAD_ID_PREFIX = 'Oculus Touch';

var PIVOT_OFFSET = {x: 0, y: -0.015, z: 0.04};

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
    left: {
      axes: {'thumbstick': [0, 1]},
      buttons: ['thumbstick', 'trigger', 'grip', 'xbutton', 'ybutton', 'surface']
    },
    right: {
      axes: {'thumbstick': [0, 1]},
      buttons: ['thumbstick', 'trigger', 'grip', 'abutton', 'bbutton', 'surface']
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
  },

  init: function () {
    var self = this;
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { self.onButtonEvent(evt.detail.id, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt.detail.id, 'up'); };
    this.onButtonTouchStart = function (evt) { self.onButtonEvent(evt.detail.id, 'touchstart'); };
    this.onButtonTouchEnd = function (evt) { self.onButtonEvent(evt.detail.id, 'touchend'); };
    this.controllerPresent = false;
    this.lastControllerCheck = 0;
    this.previousButtonValues = {};
    this.bindMethods();

    this.emitIfAxesChanged = controllerUtils.emitIfAxesChanged;   // Allow mock.
    this.checkControllerPresentAndSetup = controllerUtils.checkControllerPresentAndSetup;  // Allow mock.
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
    this.checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {
      hand: this.data.hand
    });
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    window.addEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    window.removeEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
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
    var data = this.data;
    var offset = data.hand === 'right' ? -90 : 90;
    this.el.setAttribute('tracked-controls', {
      id: data.hand === 'right' ? 'Oculus Touch (Right)' : 'Oculus Touch (Left)',
      controller: 0,
      rotationOffset: data.rotationOffset !== -999 ? data.rotationOffset : offset
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
    // Note that due to gamepadconnected event propagation issues, we don't rely on events.
    this.checkIfControllerPresent();
  },

  onButtonChanged: function (evt) {
    var button = this.mapping[this.data.hand].buttons[evt.detail.id];
    var buttonMeshes = this.buttonMeshes;
    var analogValue;

    if (!button) { return; }

    if (button === 'trigger' || button === 'grip') { analogValue = evt.detail.state.value; }

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
    this.emitIfAxesChanged(this, this.mapping[this.data.hand].axes, evt);
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
