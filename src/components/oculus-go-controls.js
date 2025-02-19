import { registerComponent } from '../core/component.js';
import { AFRAME_CDN_ROOT } from '../constants/index.js';
import { checkControllerPresentAndSetup, emitIfAxesChanged, onButtonEvent } from '../utils/tracked-controls.js';

var OCULUS_GO_CONTROLLER_MODEL_URL = AFRAME_CDN_ROOT + 'controllers/oculus/go/oculus-go-controller.gltf';

// Prefix for Gen1 and Gen2 Oculus Touch Controllers.
var GAMEPAD_ID_PREFIX = 'oculus-go';

/**
 * Button indices:
 * 0 - trigger
 * 1 - none
 * 2 - touchpad
 *
 * Axis:
 * 0 - touchpad x
 * 1 - touchpad y
 * Reference: https://github.com/immersive-web/webxr-input-profiles/blob/master/packages/registry/profiles/oculus/oculus-go.json
 */
var INPUT_MAPPING = {
  axes: {touchpad: [0, 1]},
  buttons: ['trigger', 'none', 'touchpad']
};

/**
 * Oculus Go controls.
 * Interface with Oculus Go controller and map Gamepad events to
 * controller buttons: trigger, touchpad
 * Load a controller model and highlight the pressed buttons.
 */
export var Component = registerComponent('oculus-go-controls', {
  schema: {
    hand: {default: ''},  // This informs the degenerate arm model.
    buttonColor: {type: 'color', default: '#FFFFFF'},
    buttonTouchedColor: {type: 'color', default: '#BBBBBB'},
    buttonHighlightColor: {type: 'color', default: '#7A7A7A'},
    model: {default: true}
  },

  mapping: INPUT_MAPPING,

  bindMethods: function () {
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onControllersUpdate = this.onControllersUpdate.bind(this);
    this.checkIfControllerPresent = this.checkIfControllerPresent.bind(this);
    this.removeControllersUpdateListener = this.removeControllersUpdateListener.bind(this);
    this.onAxisMoved = this.onAxisMoved.bind(this);
  },

  init: function () {
    var self = this;
    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self); };
    this.controllerPresent = false;
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
      hand: data.hand,
      idPrefix: GAMEPAD_ID_PREFIX
    });
    if (!this.data.model) { return; }
    this.el.setAttribute('gltf-model', OCULUS_GO_CONTROLLER_MODEL_URL);
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

  // No need for onButtonChanged, since Oculus Go controller has no analog buttons.

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;

    if (evt.target !== this.el || !this.data.model) { return; }
    buttonMeshes = this.buttonMeshes = {};
    buttonMeshes.trigger = controllerObject3D.getObjectByName('oculus_go_button_trigger');
    buttonMeshes.trackpad = controllerObject3D.getObjectByName('oculus_go_touchpad');
    buttonMeshes.touchpad = controllerObject3D.getObjectByName('oculus_go_touchpad');
  },

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
    if (!buttonMeshes || !buttonMeshes[buttonName]) { return; }
    var color;
    var button;
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
    button = buttonMeshes[buttonName];
    button.material.color.set(color);
  }
});
