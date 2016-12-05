var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');
var trackedControlsUtils = require('../utils/tracked-controls');

// FIXME: need appropriate models, not the vive ones!
// var TOUCH_CONTROLLER_MODEL_OBJ_PNG = 'https://cdn.rawgit.com/tbalouet/touch-controls/03e36bcb46a5b81b6796feb8953058e4ec788b47/models/touch_col.png';
var TOUCH_CONTROLLER_MODEL_OBJ_URL_L = 'https://cdn.rawgit.com/tbalouet/touch-controls/03e36bcb46a5b81b6796feb8953058e4ec788b47/models/touch_left.obj';
var TOUCH_CONTROLLER_MODEL_OBJ_MTL_L = 'https://cdn.rawgit.com/tbalouet/touch-controls/03e36bcb46a5b81b6796feb8953058e4ec788b47/models/touch_left.mtl';
var TOUCH_CONTROLLER_MODEL_OBJ_URL_R = 'https://cdn.rawgit.com/tbalouet/touch-controls/03e36bcb46a5b81b6796feb8953058e4ec788b47/models/touch_right.obj';
var TOUCH_CONTROLLER_MODEL_OBJ_MTL_R = 'https://cdn.rawgit.com/tbalouet/touch-controls/03e36bcb46a5b81b6796feb8953058e4ec788b47/models/touch_right.mtl';

/**
 * Oculus Touch Controls Component
 * Interfaces with Oculus Touch controllers and maps Gamepad events to
 * common controller buttons: trackpad, trigger, grip, menu and system
 * It loads a controller model and highlights the pressed buttons
 */
module.exports.Component = registerComponent('oculus-touch-controls', {
  dependencies: ['tracked-controls'],

  schema: {
    hand: {default: 'left'},
    buttonColor: { default: '#FAFAFA' },  // Off-white.
    buttonHighlightColor: {default: '#22D1EE'},  // Light blue.
    model: {default: true},
    rotationOffset: {default: 0} // no default offset; -999 is sentinel value to auto-determine based on hand
  },

  idPrefix: 'Oculus Touch',

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
      button3: ['oculus-touch.X', 'menu'],
      button4: ['oculus-touch.Y', 'system'],
      button5: 'surface'
    },
    'right': {
      axis0: 'thumbstick',
      axis1: 'thumbstick',
      button0: 'thumbstick',
      button1: 'trigger',
      button2: 'grip',
      button3: ['oculus-touch.A', 'menu'],
      button4: ['oculus-touch.B', 'system'],
      button5: 'surface'
    }
  },

  init: function () {
    var self = this;
    this.animationActive = 'pointing';
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { self.onButtonEvent(evt.detail.id, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt.detail.id, 'up'); };
    this.onButtonTouchStart = function (evt) { self.onButtonEvent(evt.detail.id, 'touchstart'); };
    this.onButtonTouchEnd = function (evt) { self.onButtonEvent(evt.detail.id, 'touchend'); };
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.controllerPresent = false;
    this.everGotGamepadEvent = false;
    this.lastControllerCheck = 0;
    this.onTrackedControlsTick = bind(this.onTrackedControlsTick, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.removeTrackedControlsTickListener = bind(this.removeTrackedControlsTickListener, this);
    this.onGamepadConnected = bind(this.onGamepadConnected, this);
    this.onGamepadDisconnected = bind(this.onGamepadDisconnected, this);
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
    var isPresent = false;
    trackedControlsUtils.enumerateControllers(function (gamepad) {
      if (gamepad.hand === data.hand) {
        isPresent = true;
      }
    }, this.idPrefix);

    if (isPresent !== this.controllerPresent) {
      this.controllerPresent = isPresent;
      if (isPresent) {
        this.injectTrackedControls(); // inject track-controls
        this.addEventListeners();
      } else {
        this.removeEventListeners();
      }
    }
  },

  onGamepadConnected: function (evt) {
    this.everGotGamepadEvent = true;
    this.removeTrackedControlsTickListener();
    this.checkIfControllerPresent();
  },

  onGamepadDisconnected: function (evt) {
    this.everGotGamepadEvent = true;
    this.removeTrackedControlsTickListener();
    this.checkIfControllerPresent();
  },

  play: function () {
    this.checkIfControllerPresent();
    window.addEventListener('gamepadconnected', this.onGamepadConnected, false);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected, false);
    this.addTrackedControlsTickListener();
  },

  pause: function () {
    window.removeEventListener('gamepadconnected', this.onGamepadConnected, false);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected, false);
    this.removeTrackedControlsTickListener();
    this.removeEventListeners();
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;
    var objUrl, mtlUrl;

    // handId: 0 - right, 1 - left, 2 - anything else...
    var controller = data.hand === 'right' ? 0 : data.hand === 'left' ? 1 : 2;

    if (controller === 0) {
      objUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_URL_R + ')';
      mtlUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_MTL_R + ')';
    } else {
      objUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_URL_L + ')';
      mtlUrl = 'url(' + TOUCH_CONTROLLER_MODEL_OBJ_MTL_L + ')';
    }

    // since each hand is named differently, avoid enumeration
    el.setAttribute('tracked-controls', {
      id: controller === 0 ? 'Oculus Touch (Right)' : 'Oculus Touch (Left)',
      controller: 0,
      rotationOffset: data.rotationOffset !== -999 ? data.rotationOffset : controller === 1 ? 90 : -90
    });

    if (!data.model) { return; }
    el.setAttribute('obj-model', {obj: objUrl, mtl: mtlUrl});
  },

  addTrackedControlsTickListener: function () {
    this.el.sceneEl.addEventListener('tracked-controls.tick', this.onTrackedControlsTick, false);
  },

  removeTrackedControlsTickListener: function () {
    this.el.sceneEl.removeEventListener('tracked-controls.tick', this.onTrackedControlsTick, false);
  },

  onTrackedControlsTick: function () {
    if (!this.everGotGamepadEvent) {
      this.checkIfControllerPresent();
    }
  },

  onButtonChanged: function (evt) {
    var button = this.mapping[this.data.hand]['button' + evt.detail.id];
    var buttonMeshes = this.buttonMeshes;
    var value;
    if (typeof button === 'undefined' || typeof buttonMeshes === 'undefined') { return; }
    if (button !== 'trigger' || !buttonMeshes || !buttonMeshes.trigger) { return; }
    value = evt.detail.state.value;
    buttonMeshes.trigger.rotation.x = -value * (Math.PI / 12);
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
    buttonMeshes['oculus-touch:X'] = controllerObject3D.getObjectByName('tooche1 group3 control_surface group2 button2');
    buttonMeshes['oculus-touch:A'] = controllerObject3D.getObjectByName('tooche group4 control_surface group2 button2');
    buttonMeshes['oculus-touch:Y'] = controllerObject3D.getObjectByName('tooche1 group3 control_surface group2 button3');
    buttonMeshes['oculus-touch:B'] = controllerObject3D.getObjectByName('tooche group4 control_surface group2 button3');
    buttonMeshes.surface = controllerObject3D.getObjectByName(leftHand ? 'tooche1 group3 face control_surface group2' : 'tooche group4 face control_surface group2');

    // Offset pivot point
    controllerObject3D.position.set(0, -0.015, 0.04);
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
    if (!this.data.model) { return; }
    if (Array.isArray(buttonName)) {
      for (i = 0; i < buttonName.length; i++) {
        this.updateModel(buttonName[i], evtName);
      }
    } else {
      this.updateModel(buttonName, evtName);
    }
  },

  updateModel: function (buttonName, state) {
    var color = state === 'up' ? this.data.buttonColor : this.data.buttonHighlightColor;
    var buttonMeshes = this.buttonMeshes;
    if (!buttonMeshes) { return; }
    if (buttonMeshes[buttonName]) {
      buttonMeshes[buttonName].material.color.set(color);
    }
  }
});
