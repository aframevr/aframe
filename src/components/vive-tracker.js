var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

var bind = utils.bind;
var checkControllerPresentAndSetup = utils.trackedControls.checkControllerPresentAndSetup;
var emitIfAxesChanged = utils.trackedControls.emitIfAxesChanged;

var VIVE_TRACKER_MODEL_OBJ_URL = 'https://cdn.aframe.io/controllers/vive/vr_tracker-vive.obj';
var VIVE_TRACKER_MODEL_OBJ_MTL = 'https://cdn.aframe.io/controllers/vive/vr_tracker-vive.mtl';

var GAMEPAD_ID_PREFIX = 'OpenVR ';

/**
 * Vive tracker.
 * Interface with Vive trackers and map Gamepad events to controller buttons:
 * trackpad, trigger, grip, menu, system
 * Load a controller model and highlight the pressed buttons.
 */
module.exports.Component = registerComponent('vive-tracker', {
  schema: {
    index: {default: 0},
    buttonColor: {type: 'color', default: '#FAFAFA'},  // Off-white.
    buttonHighlightColor: {type: 'color', default: '#22D1EE'},  // Light blue.
    model: {default: true},
    rotationOffset: {default: 0},
    rotation: {type: 'string', default: '-90 0 0'} // Default rotation to make orientation match tracker.
  },

  /**
   * Button IDs:
   * 0 - trackpad
   * 1 - trigger (intensity value from 0.5 to 1)
   * 2 - grip
   * 3 - menu (dispatch but better for menu options)
   * 4 - system (never dispatched on this layer)
   */
  mapping: {
    axes: {'trackpad': [0, 1]},
    buttons: ['trackpad', 'trigger', 'grip', 'menu', 'system']
  },

  /**
   * Labels for detail on axis events such as `thumbstickmoved`.
   * For example, on `thumbstickmoved` detail, the first axis returned is labeled x, and the
   * second is labeled y.
   */
  axisLabels: ['x', 'y', 'z', 'w'],

  init: function () {
    var self = this;
    this.animationActive = 'pointing';
    this.checkControllerPresentAndSetup = checkControllerPresentAndSetup;  // To allow mock.
    this.controllerPresent = false;
    this.emitIfAxesChanged = emitIfAxesChanged;  // To allow mock.
    this.lastControllerCheck = 0;
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { self.onButtonEvent(evt.detail.id, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt.detail.id, 'up'); };
    this.onButtonTouchEnd = function (evt) { self.onButtonEvent(evt.detail.id, 'touchend'); };
    this.onButtonTouchStart = function (evt) { self.onButtonEvent(evt.detail.id, 'touchstart'); };
    this.onAxisMoved = bind(this.onAxisMoved, this);
    this.previousButtonValues = {};

    this.bindMethods();
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

  checkIfControllerPresent: function () {
    this.checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {hand: undefined, index: this.data.index});
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;

    // If we have an OpenVR Gamepad, use the fixed mapping.
    el.setAttribute('tracked-controls', {
      idPrefix: GAMEPAD_ID_PREFIX,
      hand: 'none',
      controller: data.index,
      rotationOffset: data.rotationOffset,
      rotation: data.rotation
    });

    // Load model.
    if (!this.data.model) { return; }
    this.el.setAttribute('obj-model', {
      obj: VIVE_TRACKER_MODEL_OBJ_URL,
      mtl: VIVE_TRACKER_MODEL_OBJ_MTL
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

    if (!button) { return; }

    // Maybe update trigger rotation depending on button value?
    // Actually don't, since tracker model does not have any.

    // Pass along changed event with button state, using button mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;

    if (!this.data.model) { return; }

    // Store button meshes object to be able to change their colors.
    // Set default colors.
    // Actually don't, since tracker model does not have any.

    // Offset pivot point.
    controllerObject3D.position.set(0, 0, 0);
  },

  onAxisMoved: function (evt) {
    this.emitIfAxesChanged(this, this.mapping.axes, evt);
  },

  onButtonEvent: function (id, evtName) {
    var buttonName = this.mapping.buttons[id];
    var i;

    // Emit events.
    if (Array.isArray(buttonName)) {
      for (i = 0; i < buttonName.length; i++) {
        this.el.emit(buttonName[i] + evtName);
      }
    } else {
      this.el.emit(buttonName + evtName);
    }

    if (!this.data.model) { return; }

    // Don't change color for trackpad touch.
    // Update colors.
    // Actually don't, since tracker model does not have any.
  }
});
