import { registerComponent } from '../core/component.js';
import { AFRAME_CDN_ROOT } from '../constants/index.js';
import { checkControllerPresentAndSetup, emitIfAxesChanged, onButtonEvent } from '../utils/tracked-controls.js';

// See Profiles Registry:
// https://github.com/immersive-web/webxr-input-profiles/tree/master/packages/registry
// TODO: Add a more robust system for deriving gamepad name.
var GAMEPAD_ID_PREFIX = 'magicleap';
var GAMEPAD_ID_SUFFIX = '-one';
var GAMEPAD_ID_COMPOSITE = GAMEPAD_ID_PREFIX + GAMEPAD_ID_SUFFIX;
var MAGICLEAP_CONTROLLER_MODEL_GLB_URL = AFRAME_CDN_ROOT + 'controllers/magicleap/magicleap-one-controller.glb';

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

/**
 * Magic Leap Controls
 * Interface with Magic Leap control and map Gamepad events to controller
 * buttons: trigger, grip, touchpad, and menu.
 * Load a controller model.
 */
export var Component = registerComponent('magicleap-controls', {
  schema: {
    hand: {default: 'none'},
    model: {default: true}
  },

  mapping: INPUT_MAPPING_WEBXR,

  init: function () {
    var self = this;
    this.controllerPresent = false;
    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self); };
    this.previousButtonValues = {};

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
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onControllersUpdate = this.onControllersUpdate.bind(this);
    this.checkIfControllerPresent = this.checkIfControllerPresent.bind(this);
    this.removeControllersUpdateListener = this.removeControllersUpdateListener.bind(this);
    this.onAxisMoved = this.onAxisMoved.bind(this);
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
    checkControllerPresentAndSetup(this, GAMEPAD_ID_COMPOSITE,
                                   {index: this.controllerIndex, hand: data.hand});
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;

    el.setAttribute('tracked-controls', {
      // TODO: verify expected behavior between reserved prefixes.
      idPrefix: GAMEPAD_ID_COMPOSITE,
      hand: data.hand,
      controller: this.controllerIndex
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
    emitIfAxesChanged(this, this.mapping.axes, evt);
  },

  updateModel: function (buttonName, evtName) {},

  setButtonColor: function (buttonName, color) {}

});
