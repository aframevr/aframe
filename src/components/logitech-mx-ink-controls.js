import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
import { AFRAME_CDN_ROOT } from '../constants/index.js';
import { checkControllerPresentAndSetup, emitIfAxesChanged, onButtonEvent } from '../utils/tracked-controls.js';

// See Profiles Registry:
// https://github.com/immersive-web/webxr-input-profiles/tree/master/packages/registry
// TODO: Add a more robust system for deriving gamepad name.
var GAMEPAD_ID = 'logitech-mx-ink';
var LOGITECH_MX_INK_MODEL_GLB_BASE_URL = AFRAME_CDN_ROOT + 'controllers/logitech/';

/**
 * Button IDs:
 * 0 - trigger
 * 1 - squeeze
 * 5 - touchpad
 * 6 - tip
 * 7 - dock
 *
*/
var INPUT_MAPPING_WEBXR = {
  left: {
    buttons: ['front', 'back', 'none', 'none', 'none', 'tip']
  },
  right: {
    buttons: ['front', 'back', 'none', 'none', 'none', 'tip']
  }
};

/**
 * Logitech MX Ink Controls
 */
export var Component = registerComponent('logitech-mx-ink-controls', {
  schema: {
    hand: {default: 'left'},
    model: {default: true},
    orientationOffset: {type: 'vec3'}
  },

  mapping: INPUT_MAPPING_WEBXR,

  init: function () {
    var self = this;
    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self, self.data.hand); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self, self.data.hand); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self, self.data.hand); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self, self.data.hand); };
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
    el.sceneEl.removeEventListener('enter-vr', this.onEnterVR);
    el.sceneEl.removeEventListener('exit-vr', this.onExitVR);
    this.controllerEventsActive = false;
  },

  checkIfControllerPresent: function () {
    var controllerObject3D = this.controllerObject3D;
    if (controllerObject3D) { controllerObject3D.visible = false; }
    checkControllerPresentAndSetup(this, GAMEPAD_ID, {
      hand: this.data.hand,
      iterateControllerProfiles: true
    });
  },

  injectTrackedControls: function () {
    var el = this.el;
    var data = this.data;
    var id = GAMEPAD_ID;
    el.setAttribute('tracked-controls', {
      id: id,
      hand: data.hand,
      handTrackingEnabled: false,
      iterateControllerProfiles: true,
      orientationOffset: data.orientationOffset
    });
    this.loadModel();
  },

  loadModel: function () {
    var controllerObject3D = this.controllerObject3D;
    if (!this.data.model) { return; }
    if (controllerObject3D) {
      controllerObject3D.visible = this.el.sceneEl.is('vr-mode');
      this.el.setObject3D('mesh', controllerObject3D);
      return;
    }
    this.el.setAttribute('gltf-model', LOGITECH_MX_INK_MODEL_GLB_BASE_URL + 'logitech-mx-ink.glb');
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
    if (evt.target !== this.el || !this.data.model) { return; }

    this.el.emit('controllermodelready', {
      name: 'logitech-mx-ink-controls',
      model: this.data.model,
      rayOrigin: new THREE.Vector3(0, 0, 0)
    });

    this.controllerObject3D = this.el.getObject3D('mesh');
    this.controllerObject3D.visible = this.el.sceneEl.is('vr-mode');
  },

  onAxisMoved: function (evt) {
    emitIfAxesChanged(this, this.mapping.axes, evt);
  }
});
