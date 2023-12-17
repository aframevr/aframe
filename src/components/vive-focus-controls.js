var registerComponent = require('../core/component').registerComponent;
var bind = require('../utils/bind');

var trackedControlsUtils = require('../utils/tracked-controls');
var checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;
var emitIfAxesChanged = trackedControlsUtils.emitIfAxesChanged;
var onButtonEvent = trackedControlsUtils.onButtonEvent;

var GAMEPAD_ID_PREFIX = 'HTC Vive Focus';

var AFRAME_CDN_ROOT = require('../constants').AFRAME_CDN_ROOT;
var VIVE_FOCUS_CONTROLLER_MODEL_URL = AFRAME_CDN_ROOT + 'controllers/vive/focus-controller/focus-controller.gltf';

/**
 * Vive Focus controls.
 * Interface with Vive Focus controller and map Gamepad events to
 * controller buttons: trackpad, trigger
 * Load a controller model and highlight the pressed buttons.
 */
module.exports.Component = registerComponent('vive-focus-controls', {
  schema: {
    hand: {default: ''},  // This informs the degenerate arm model.
    buttonTouchedColor: {type: 'color', default: '#BBBBBB'},
    buttonHighlightColor: {type: 'color', default: '#7A7A7A'},
    model: {default: true},
    orientationOffset: {type: 'vec3'},
    armModel: {default: true}
  },

  /**
   * Button IDs:
   * 0 - trackpad
   * 1 - trigger
   */
  mapping: {
    axes: {trackpad: [0, 1]},
    buttons: ['trackpad', 'trigger']
  },

  bindMethods: function () {
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.removeControllersUpdateListener = bind(this.removeControllersUpdateListener, this);
    this.onAxisMoved = bind(this.onAxisMoved, this);
  },

  init: function () {
    var self = this;
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self); };
    this.controllerPresent = false;
    this.lastControllerCheck = 0;
    this.bindMethods();
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('model-loaded', this.onModelLoaded);
    el.addEventListener('axismove', this.onAxisMoved);
    this.controllerEventsActive = true;
    this.addControllersUpdateListener();
  },

  removeEventListeners: function () {
    var el = this.el;
    el.removeEventListener('buttonchanged', this.onButtonChanged);
    el.removeEventListener('buttondown', this.onButtonDown);
    el.removeEventListener('buttonup', this.onButtonUp);
    el.removeEventListener('touchstart', this.onButtonTouchStart);
    el.removeEventListener('touchend', this.onButtonTouchEnd);
    el.removeEventListener('model-loaded', this.onModelLoaded);
    el.removeEventListener('axismove', this.onAxisMoved);
    this.controllerEventsActive = false;
    this.removeControllersUpdateListener();
  },

  checkIfControllerPresent: function () {
    checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX,
                                        this.data.hand ? {hand: this.data.hand} : {});
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;
    el.setAttribute('tracked-controls', {
      armModel: data.armModel,
      idPrefix: GAMEPAD_ID_PREFIX,
      orientationOffset: data.orientationOffset
    });
    if (!this.data.model) { return; }
    this.el.setAttribute('gltf-model', VIVE_FOCUS_CONTROLLER_MODEL_URL);
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

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;

    if (evt.target !== this.el || !this.data.model) { return; }
    buttonMeshes = this.buttonMeshes = {};
    buttonMeshes.trigger = controllerObject3D.getObjectByName('BumperKey');
    buttonMeshes.triggerPressed = controllerObject3D.getObjectByName('BumperKey_Press');
    if (buttonMeshes.triggerPressed) {
      buttonMeshes.triggerPressed.visible = false;
    }
    buttonMeshes.trackpad = controllerObject3D.getObjectByName('TouchPad');
    buttonMeshes.trackpadPressed = controllerObject3D.getObjectByName('TouchPad_Press');
    if (buttonMeshes.trackpadPressed) {
      buttonMeshes.trackpadPressed.visible = false;
    }
  },

  // No analog buttons, only emits 0/1 values
  onButtonChanged: function (evt) {
    var button = this.mapping.buttons[evt.detail.id];
    if (!button) return;
    // Pass along changed event with button state, using button mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onAxisMoved: function (evt) {
    emitIfAxesChanged(this, this.mapping.axes, evt);
  },

  updateModel: function (buttonName, evtName) {
    if (!this.data.model) { return; }
    this.updateButtonModel(buttonName, evtName);
  },

  updateButtonModel: function (buttonName, state) {
    var buttonMeshes = this.buttonMeshes;
    var pressedName = buttonName + 'Pressed';
    if (!buttonMeshes || !buttonMeshes[buttonName] || !buttonMeshes[pressedName]) {
      return;
    }
    var color;
    switch (state) {
      case 'down':
        color = this.data.buttonHighlightColor;
        break;
      case 'touchstart':
        color = this.data.buttonTouchedColor;
        break;
    }
    if (color) {
      buttonMeshes[pressedName].material.color.set(color);
    }
    buttonMeshes[pressedName].visible = !!color;
    buttonMeshes[buttonName].visible = !color;
  }
});
