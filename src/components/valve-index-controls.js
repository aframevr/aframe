import { registerComponent } from '../core/component.js';
import * as THREE from 'three';
import { AFRAME_CDN_ROOT } from '../constants/index.js';
import { checkControllerPresentAndSetup, emitIfAxesChanged, onButtonEvent } from '../utils/tracked-controls.js';

var INDEX_CONTROLLER_MODEL_BASE_URL = AFRAME_CDN_ROOT + 'controllers/valve/index/valve-index-';
var INDEX_CONTROLLER_MODEL_URL = {
  left: INDEX_CONTROLLER_MODEL_BASE_URL + 'left.glb',
  right: INDEX_CONTROLLER_MODEL_BASE_URL + 'right.glb'
};

var GAMEPAD_ID_PREFIX = 'valve';

var INDEX_CONTROLLER_ROTATION_OFFSET = {
  left: {x: 0, y: -0.05, z: 0.06},
  right: {x: 0, y: -0.05, z: 0.06}
};

var INDEX_CONTROLLER_POSITION_OFFSET = {
  left: {_x: Math.PI / 3, _y: 0, _z: 0, _order: 'XYZ'},
  right: {_x: Math.PI / 3, _y: 0, _z: 0, _order: 'XYZ'}
};

/**
 * Vive controls.
 * Interface with Vive controllers and map Gamepad events to controller buttons:
 * trackpad, trigger, grip, menu, system
 * Load a controller model and highlight the pressed buttons.
 */
export var Component = registerComponent('valve-index-controls', {
  schema: {
    hand: {default: 'left'},
    buttonColor: {type: 'color', default: '#FAFAFA'},  // Off-white.
    buttonHighlightColor: {type: 'color', default: '#22D1EE'},  // Light blue.
    model: {default: true}
  },

  after: ['tracked-controls'],

  mapping: {
    axes: {
      trackpad: [0, 1],
      thumbstick: [2, 3]
    },
    buttons: ['trigger', 'grip', 'trackpad', 'thumbstick', 'abutton']
  },

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
    var controllerIndex = data.hand === 'right' ? 0 : data.hand === 'left' ? 1 : 2;
    checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {index: controllerIndex, iterateControllerProfiles: true, hand: data.hand});
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;

    // If we have an OpenVR Gamepad, use the fixed mapping.
    el.setAttribute('tracked-controls', {
      idPrefix: GAMEPAD_ID_PREFIX,
      // Hand IDs: 1 = right, 0 = left, 2 = anything else.
      controller: data.hand === 'right' ? 1 : data.hand === 'left' ? 0 : 2,
      hand: data.hand
    });

    this.loadModel();
  },

  loadModel: function () {
    var data = this.data;
    if (!data.model) { return; }
    this.el.setAttribute('gltf-model', '' + INDEX_CONTROLLER_MODEL_URL[data.hand] + '');
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
        buttonMeshes.trigger.rotation.x = this.triggerOriginalRotationX - analogValue * (Math.PI / 40);
      }
    }

    // Pass along changed event with button state, using button mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onModelLoaded: function (evt) {
    var buttonMeshes;
    var controllerObject3D = evt.detail.model;
    var self = this;

    if (evt.target !== this.el || !this.data.model) { return; }

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
    this.triggerOriginalRotationX = buttonMeshes.trigger.rotation.x;

    // Set default colors.
    Object.keys(buttonMeshes).forEach(function (buttonName) {
      self.setButtonColor(buttonName, self.data.buttonColor);
    });

    // Offset pivot point.
    controllerObject3D.position.copy(INDEX_CONTROLLER_POSITION_OFFSET[this.data.hand]);
    controllerObject3D.rotation.copy(INDEX_CONTROLLER_ROTATION_OFFSET[this.data.hand]);

    this.el.emit('controllermodelready', {
      name: 'valve-index-controls',
      model: this.data.model,
      rayOrigin: new THREE.Vector3(0, 0, 0)
    });
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
    // TODO: The meshes aren't set up correctly now, skipping for the moment
    return;
  }
});
