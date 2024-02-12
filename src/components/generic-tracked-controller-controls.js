import { registerComponent } from '../core/component.js';
import { checkControllerPresentAndSetup, emitIfAxesChanged, onButtonEvent } from '../utils/tracked-controls.js';

var GAMEPAD_ID_PREFIX = 'generic';

/**
 * Button indices:
 * 0 - trigger
 * 1 - squeeze
 * 2 - touchpad
 * 3 - thumbstick
 *
 * Axis:
 * 0 - touchpad
 * 1 - thumbstick
 *
 */
var INPUT_MAPPING = {
  axes: {
    touchpad: [0, 1],
    thumbstick: [2, 3]
  },
  buttons: ['trigger', 'squeeze', 'touchpad', 'thumbstick']
};

/**
 * Oculus Go controls.
 * Interface with Oculus Go controller and map Gamepad events to
 * controller buttons: trackpad, trigger
 * Load a controller model and highlight the pressed buttons.
 */
export var Component = registerComponent('generic-tracked-controller-controls', {
  schema: {
    hand: {default: ''},  // This informs the degenerate arm model.
    defaultModel: {default: true},
    defaultModelColor: {default: 'gray'},
    disabled: {default: false}
  },

  after: ['tracked-controls'],

  /**
   * Button IDs:
   * 0 - trackpad
   * 1 - trigger
   */
  mapping: INPUT_MAPPING,

  bindMethods: function () {
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
    this.wasControllerConnected = false;
    this.bindMethods();

    // generic-tracked-controller-controls has the lowest precedence.
    // Disable this component if there are more specialized controls components.
    this.el.addEventListener('controllerconnected', function (evt) {
      if (evt.detail.name === self.name) { return; }
      self.wasControllerConnected = true;
      self.removeEventListeners();
      self.removeControllersUpdateListener();
    });
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
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
    el.removeEventListener('axismove', this.onAxisMoved);
    this.controllerEventsActive = false;
  },

  checkIfControllerPresent: function () {
    var data = this.data;
    var hand = data.hand ? data.hand : undefined;
    checkControllerPresentAndSetup(
      this, GAMEPAD_ID_PREFIX,
      {hand: hand, iterateControllerProfiles: true});
  },

  play: function () {
    if (this.wasControllerConnected) { return; }
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

    // Do nothing if tracked-controls already set.
    // Generic controls have the lowest precedence.
    if (this.el.components['tracked-controls']) {
      this.removeEventListeners();
      return;
    }
    el.setAttribute('tracked-controls', {
      hand: data.hand,
      idPrefix: GAMEPAD_ID_PREFIX,
      iterateControllerProfiles: true
    });
    if (!this.data.defaultModel) { return; }
    this.initDefaultModel();
  },

  addControllersUpdateListener: function () {
    this.el.sceneEl.addEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  removeControllersUpdateListener: function () {
    this.el.sceneEl.removeEventListener('controllersupdated', this.onControllersUpdate, false);
  },

  onControllersUpdate: function () {
    if (!this.wasControllerConnected) { return; }
    this.checkIfControllerPresent();
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

  initDefaultModel: function () {
    var modelEl = this.modelEl = document.createElement('a-entity');
    modelEl.setAttribute('geometry', {
      primitive: 'sphere',
      radius: 0.03
    });
    modelEl.setAttribute('material', {color: this.data.color});
    this.el.appendChild(modelEl);
    this.el.emit('controllermodelready', {
      name: 'generic-tracked-controller-controls',
      model: this.modelEl,
      rayOrigin: {origin: {x: 0, y: 0, z: -0.01}, direction: {x: 0, y: 0, z: -1}}
    });
  }
});
