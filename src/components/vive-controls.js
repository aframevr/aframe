var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');

var trackedControlsUtils = require('../utils/tracked-controls');
var checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;
var emitIfAxesChanged = trackedControlsUtils.emitIfAxesChanged;
var onButtonEvent = trackedControlsUtils.onButtonEvent;

var VIVE_CONTROLLER_MODEL_OBJ_URL = 'https://cdn.aframe.io/controllers/vive/vr_controller_vive.obj';
var VIVE_CONTROLLER_MODEL_OBJ_MTL = 'https://cdn.aframe.io/controllers/vive/vr_controller_vive.mtl';

var isWebXRAvailable = require('../utils/').device.isWebXRAvailable;

var GAMEPAD_ID_WEBXR = 'htc-vive';
var GAMEPAD_ID_WEBVR = 'OpenVR ';

// Prefix for Gen1 and Gen2 Oculus Touch Controllers.
var GAMEPAD_ID_PREFIX = isWebXRAvailable ? GAMEPAD_ID_WEBXR : GAMEPAD_ID_WEBVR;

/**
 * Button IDs:
 * 0 - trackpad
 * 1 - trigger (intensity value from 0.5 to 1)
 * 2 - grip
 * 3 - menu (dispatch but better for menu options)
 * 4 - system (never dispatched on this layer)
 */
var INPUT_MAPPING_WEBVR = {
  axes: {trackpad: [0, 1]},
  buttons: ['trackpad', 'trigger', 'grip', 'menu', 'system']
};

/**
 * Button IDs:
 * 0 - trigger
 * 1 - squeeze
 * 2 - touchpad
 * 3 - none (dispatch but better for menu options)
 * 4 - menu (never dispatched on this layer)
 *
 * Axis:
 * 0 - touchpad x axis
 * 1 - touchpad y axis
 * Reference: https://github.com/immersive-web/webxr-input-profiles/blob/master/packages/registry/profiles/htc/htc-vive.json
 */
var INPUT_MAPPING_WEBXR = {
  axes: {thumbstick: [0, 1]},
  buttons: ['trigger', 'grip', 'trackpad', 'none', 'menu']
};

var INPUT_MAPPING = isWebXRAvailable ? INPUT_MAPPING_WEBXR : INPUT_MAPPING_WEBVR;

/**
 * Vive controls.
 * Interface with Vive controllers and map Gamepad events to controller buttons:
 * trackpad, trigger, grip, menu, system
 * Load a controller model and highlight the pressed buttons.
 */
module.exports.Component = registerComponent('vive-controls', {
  schema: {
    hand: {default: 'left'},
    buttonColor: {type: 'color', default: '#FAFAFA'},  // Off-white.
    buttonHighlightColor: {type: 'color', default: '#22D1EE'},  // Light blue.
    model: {default: true},
    orientationOffset: {type: 'vec3'}
  },

  mapping: INPUT_MAPPING,

  init: function () {
    var self = this;
    this.controllerPresent = false;
    this.lastControllerCheck = 0;
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self); };
    this.previousButtonValues = {};
    this.rendererSystem = this.el.sceneEl.systems.renderer;

    this.bindMethods();
  },

  update: function () {
    var data = this.data;
    this.controllerIndex = data.hand === 'right' ? 0 : data.hand === 'left' ? 1 : 2;
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
  },

  bindMethods: function () {
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.removeControllersUpdateListener = bind(this.removeControllersUpdateListener, this);
    this.onAxisMoved = bind(this.onAxisMoved, this);
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('model-loaded', this.onModelLoaded);
    el.addEventListener('axismove', this.onAxisMoved);
    this.controllerEventsActive = true;
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('buttonchanged', this.onButtonChanged);
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('touchend', this.onButtonTouchEnd);
    el.removeEventListener('touchstart', this.onButtonTouchStart);
    el.removeEventListener('model-loaded', this.onModelLoaded);
    el.removeEventListener('axismove', this.onAxisMoved);
    this.controllerEventsActive = false;
  },

  /**
   * Once OpenVR returns correct hand data in supporting browsers, we can use hand property.
   * var isPresent = checkControllerPresentAndSetup(this.el.sceneEl, GAMEPAD_ID_PREFIX,
                                                        { hand: data.hand });
   * Until then, use hardcoded index.
   */
  checkIfControllerPresent: function () {
    var data = this.data;
    checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {index: this.controllerIndex, hand: data.hand});
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;

    // If we have an OpenVR Gamepad, use the fixed mapping.
    el.setAttribute('tracked-controls', {
      idPrefix: GAMEPAD_ID_PREFIX,
      hand: data.hand,
      controller: this.controllerIndex,
      orientationOffset: data.orientationOffset
    });

    // Load model.
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
    this.checkIfControllerPresent();
  },

  /**
   * Rotate the trigger button based on how hard the trigger is pressed.
   */
  onButtonChanged: function (evt) {
    var button = this.mapping.buttons[evt.detail.id];
    var buttonMeshes = this.buttonMeshes;
    var analogValue;

    if (!button) { return; }

    if (button === 'trigger') {
      analogValue = evt.detail.state.value;
      // Update trigger rotation depending on button value.
      if (buttonMeshes && buttonMeshes.trigger) {
        buttonMeshes.trigger.rotation.x = -analogValue * (Math.PI / 12);
      }
    }

    // Pass along changed event with button state, using button mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onModelLoaded: function (evt) {
    var buttonMeshes;
    var controllerObject3D = evt.detail.model;
    var self = this;

    if (!this.data.model) { return; }

    // Store button meshes object to be able to change their colors.
    buttonMeshes = this.buttonMeshes = {};
    buttonMeshes.grip = {
      left: controllerObject3D.getObjectByName('leftgrip'),
      right: controllerObject3D.getObjectByName('rightgrip')
    };
    buttonMeshes.menu = controllerObject3D.getObjectByName('menubutton');
    buttonMeshes.system = controllerObject3D.getObjectByName('systembutton');
    buttonMeshes.trackpad = controllerObject3D.getObjectByName('touchpad');
    buttonMeshes.trigger = controllerObject3D.getObjectByName('trigger');

    // Set default colors.
    Object.keys(buttonMeshes).forEach(function (buttonName) {
      self.setButtonColor(buttonName, self.data.buttonColor);
    });

    // Offset pivot point.
    controllerObject3D.position.set(0, -0.015, 0.04);
  },

  onAxisMoved: function (evt) {
    emitIfAxesChanged(this, this.mapping.axes, evt);
  },

  updateModel: function (buttonName, evtName) {
    var color;
    var isTouch;
    if (!this.data.model) { return; }

    isTouch = evtName.indexOf('touch') !== -1;
    // Don't change color for trackpad touch.
    if (isTouch) { return; }

    // Update colors.
    color = evtName === 'up' ? this.data.buttonColor : this.data.buttonHighlightColor;
    this.setButtonColor(buttonName, color);
  },

  setButtonColor: function (buttonName, color) {
    var buttonMeshes = this.buttonMeshes;
    var rendererSystem = this.rendererSystem;

    if (!buttonMeshes) { return; }

    // Need to do both left and right sides for grip.
    if (buttonName === 'grip') {
      buttonMeshes.grip.left.material.color.set(color);
      buttonMeshes.grip.right.material.color.set(color);
      rendererSystem.applyColorCorrection(buttonMeshes.grip.left.material.color);
      rendererSystem.applyColorCorrection(buttonMeshes.grip.right.material.color);
      return;
    }
    buttonMeshes[buttonName].material.color.set(color);
    rendererSystem.applyColorCorrection(buttonMeshes[buttonName].material.color);
  }
});
