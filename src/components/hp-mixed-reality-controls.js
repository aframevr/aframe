var bind = require('../utils/bind');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var trackedControlsUtils = require('../utils/tracked-controls');
var checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;
var emitIfAxesChanged = trackedControlsUtils.emitIfAxesChanged;
var onButtonEvent = trackedControlsUtils.onButtonEvent;

// See Profiles Registry:
// https://github.com/immersive-web/webxr-input-profiles/tree/master/packages/registry
// TODO: Add a more robust system for deriving gamepad name.
var GAMEPAD_ID = 'hp-mixed-reality';
var AFRAME_CDN_ROOT = require('../constants').AFRAME_CDN_ROOT;
var HP_MIXEDL_REALITY_MODEL_GLB_BASE_URL = AFRAME_CDN_ROOT + 'controllers/hp/mixed-reality/';

var HP_MIXED_REALITY_POSITION_OFFSET = {x: 0, y: 0, z: 0.06};
var HP_MIXED_REALITY_ROTATION_OFFSET = {_x: Math.PI / 4, _y: 0, _z: 0, _order: 'XYZ'};

/**
 * Button IDs:
 * 0 - trigger
 * 1 - grip
 * 3 - X / A
 * 4 - Y / B
 *
 * Axis:
 * 2 - joystick x axis
 * 3 - joystick y axis
 */
var INPUT_MAPPING_WEBXR = {
  left: {
    axes: {touchpad: [2, 3]},
    buttons: ['trigger', 'grip', 'none', 'thumbstick', 'xbutton', 'ybutton']
  },
  right: {
    axes: {touchpad: [2, 3]},
    buttons: ['trigger', 'grip', 'none', 'thumbstick', 'abutton', 'bbutton']
  }
};

/**
 * HP Mixed Reality Controls
 */
module.exports.Component = registerComponent('hp-mixed-reality-controls', {
  schema: {
    hand: {default: 'none'},
    model: {default: true},
    orientationOffset: {type: 'vec3'}
  },

  mapping: INPUT_MAPPING_WEBXR,

  init: function () {
    var self = this;
    this.controllerPresent = false;
    this.lastControllerCheck = 0;
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self, self.data.hand); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self, self.data.hand); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self, self.data.hand); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self, self.data.hand); };
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
    checkControllerPresentAndSetup(this, GAMEPAD_ID,
                                   {index: this.controllerIndex, hand: data.hand});
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;

    el.setAttribute('tracked-controls', {
      // TODO: verify expected behavior between reserved prefixes.
      idPrefix: GAMEPAD_ID,
      hand: data.hand,
      controller: this.controllerIndex,
      orientationOffset: data.orientationOffset
    });

    // Load model.
    if (!this.data.model) { return; }
    this.el.setAttribute('gltf-model', HP_MIXEDL_REALITY_MODEL_GLB_BASE_URL + this.data.hand + '.glb');
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

    if (!this.data.model) { return; }

    controllerObject3D.position.copy(HP_MIXED_REALITY_POSITION_OFFSET);
    controllerObject3D.rotation.copy(HP_MIXED_REALITY_ROTATION_OFFSET);

    this.el.emit('controllermodelready', {
      name: 'hp-mixed-reality-controls',
      model: this.data.model,
      rayOrigin: new THREE.Vector3(0, 0, 0)
    });
  },

  onAxisMoved: function (evt) {
    emitIfAxesChanged(this, this.mapping.axes, evt);
  }
});
