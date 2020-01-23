var bind = require('../utils/bind');
var registerComponent = require('../core/component').registerComponent;

var trackedControlsUtils = require('../utils/tracked-controls');
var checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;
var emitIfAxesChanged = trackedControlsUtils.emitIfAxesChanged;
var onButtonEvent = trackedControlsUtils.onButtonEvent;

var isWebXRAvailable = require('../utils/').device.isWebXRAvailable;

var GAMEPAD_ID_PREFIX = 'magic-leap';

var MAGICLEAP_CONTROLLER_MODEL_GLB_URL = 'https://cdn.aframe.io/controllers/magicleap/control.glb';

/**
 * Button IDs:
 * 0 - trigger (intensity value from 0.5 to 1)
 * 1 - grip
 * 2 - touchpad
 * 3 - menu (dispatch but better for menu options)
 *
 * Axis:
 * 0 - touchpad x axis
 * 1 - touchpad y axis
 */
var INPUT_MAPPING_WEBVR = {
  axes: {touchpad: [0, 1]},
  buttons: ['trigger', 'grip', 'touchpad', 'menu']
};

/**
 * Button IDs:
 * 0 - trigger
 * 1 - grip
 * 2 - touchpad
 * 3 - menu (never dispatched on this layer)
 *
 * Axis:
 * 0 - touchpad x axis
 * 1 - touchpad y axis
 */
var INPUT_MAPPING_WEBXR = {
  axes: {touchpad: [0, 1]},
  buttons: ['trigger', 'grip', 'touchpad', 'menu']
};

var INPUT_MAPPING = isWebXRAvailable ? INPUT_MAPPING_WEBXR : INPUT_MAPPING_WEBVR;

/**
 * Magic Leap Controls
 * Interface with Magic Leap control and map Gamepad events to controller
 * buttons: trigger, grip, touchpad, and menu.
 * Load a controller model.
 */
module.exports.Component = registerComponent('magicleap-controls', {
  schema: {
    hand: {default: 'none'},
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
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('axismove', this.onAxisMoved);
    el.addEventListener('model-loaded', this.onModelLoaded);
    this.controllerEventsActive = true;
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
    this.controllerEventsActive = false;
  },

  checkIfControllerPresent: function () {
    var data = this.data;
    checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX,
                                   {index: this.controllerIndex, hand: data.hand});
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;

    el.setAttribute('tracked-controls', {
      idPrefix: GAMEPAD_ID_PREFIX,
      hand: data.hand,
      controller: this.controllerIndex,
      orientationOffset: data.orientationOffset
    });

    // Load model.
    if (!this.data.model) { return; }
    this.el.setAttribute('gltf-model', MAGICLEAP_CONTROLLER_MODEL_GLB_URL);
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

  /**
   * Rotate the trigger button based on how hard the trigger is pressed.
   */
  onButtonChanged: function (evt) {
    var button = this.mapping.buttons[evt.detail.id];
    var analogValue;

    if (!button) { return; }
    if (button === 'trigger') {
      analogValue = evt.detail.state.value;
      console.log('analog value of trigger press: ' + analogValue);
    }

    // Pass along changed event with button state, using button mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    // our glb scale is too large.
    controllerObject3D.scale.set(0.01, 0.01, 0.01);
  },

  onAxisMoved: function (evt) {
    emitIfAxesChanged(this, this.mapping[this.data.hand].axes, evt);
  },

  updateModel: function (buttonName, evtName) {},

  setButtonColor: function (buttonName, color) {}

});
