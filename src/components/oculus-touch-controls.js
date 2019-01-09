var bind = require('../utils/bind');
var registerComponent = require('../core/component').registerComponent;
var trackedControlsUtils = require('../utils/tracked-controls');
var THREE = require('../lib/three');
var onButtonEvent = trackedControlsUtils.onButtonEvent;

var TOUCH_CONTROLLER_MODEL_BASE_URL = 'https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-';
var TOUCH_CONTROLLER_MODEL_URL = {
  left: TOUCH_CONTROLLER_MODEL_BASE_URL + 'left.gltf',
  right: TOUCH_CONTROLLER_MODEL_BASE_URL + 'right.gltf'
};

var GAMEPAD_ID_PREFIX = 'Oculus Touch';

var RAY_ORIGIN = {
  left: {origin: {x: 0.008, y: -0.004, z: 0}, direction: {x: 0, y: -0.8, z: -1}},
  right: {origin: {x: -0.008, y: -0.004, z: 0}, direction: {x: 0, y: -0.8, z: -1}}
};

/**
 * Oculus Touch controls.
 * Interface with Oculus Touch controllers and map Gamepad events to
 * controller buttons: thumbstick, trigger, grip, xbutton, ybutton, surface
 * Load a controller model and highlight the pressed buttons.
 */
module.exports.Component = registerComponent('oculus-touch-controls', {
  schema: {
    hand: {default: 'left'},
    buttonColor: {type: 'color', default: '#999'},  // Off-white.
    buttonTouchColor: {type: 'color', default: '#8AB'},
    buttonHighlightColor: {type: 'color', default: '#2DF'},  // Light blue.
    model: {default: true},
    orientationOffset: {type: 'vec3', default: {x: 43, y: 0, z: 0}}
  },

  /**
   * Button IDs:
   * 0 - thumbstick (which has separate axismove / thumbstickmoved events)
   * 1 - trigger (with analog value, which goes up to 1)
   * 2 - grip (with analog value, which goes up to 1)
   * 3 - X (left) or A (right)
   * 4 - Y (left) or B (right)
   * 5 - surface (touch only)
   */
  mapping: {
    left: {
      axes: {thumbstick: [0, 1]},
      buttons: ['thumbstick', 'trigger', 'grip', 'xbutton', 'ybutton', 'surface']
    },
    right: {
      axes: {thumbstick: [0, 1]},
      buttons: ['thumbstick', 'trigger', 'grip', 'abutton', 'bbutton', 'surface']
    }
  },

  bindMethods: function () {
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.onAxisMoved = bind(this.onAxisMoved, this);
    this.onThumbstickMoved = bind(this.onThumbstickMoved, this);
  },

  init: function () {
    var self = this;
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self, self.data.hand); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self, self.data.hand); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self, self.data.hand); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self, self.data.hand); };
    this.controllerPresent = false;
    this.lastControllerCheck = 0;
    this.previousButtonValues = {};
    this.bindMethods();

    // Allow mock.
    this.emitIfAxesChanged = trackedControlsUtils.emitIfAxesChanged;
    this.checkControllerPresentAndSetup = trackedControlsUtils.checkControllerPresentAndSetup;
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
    el.addEventListener('thumbstickmoved', this.onThumbstickMoved);
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
    el.removeEventListener('thumbstickmoved', this.onThumbstickMoved);
    this.controllerEventsActive = false;
  },

  checkIfControllerPresent: function () {
    this.checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {
      hand: this.data.hand
    });
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();
  },

  loadModel: function () {
    var data = this.data;
    if (!data.model) { return; }
    this.el.setAttribute('gltf-model', 'url(' + TOUCH_CONTROLLER_MODEL_URL[data.hand] + ')');
  },

  injectTrackedControls: function () {
    var data = this.data;
    this.el.setAttribute('tracked-controls', {
      id: data.hand === 'right' ? 'Oculus Touch (Right)' : 'Oculus Touch (Left)',
      controller: 0,
      hand: data.hand,
      orientationOffset: data.orientationOffset
    });
    this.loadModel();
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
    var buttonMeshes = this.buttonMeshes;
    var analogValue;

    if (!button) { return; }

    if (button === 'trigger' || button === 'grip') { analogValue = evt.detail.state.value; }

    // Update trigger and/or grip meshes, if any.
    if (buttonMeshes) {
      if (button === 'trigger' && buttonMeshes.trigger) {
        buttonMeshes.trigger.rotation.x = this.originalXRotationTrigger - analogValue * (Math.PI / 26);
      }
      if (button === 'grip' && buttonMeshes.grip) {
        buttonMeshes.grip.position.x = this.originalXPositionGrip + (this.data.hand === 'left' ? -1 : 1) * analogValue * 0.004;
      }
    }

    // Pass along changed event with button state, using the buttom mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var buttonMeshes;
    if (!this.data.model) { return; }

    buttonMeshes = this.buttonMeshes = {};

    buttonMeshes.grip = controllerObject3D.getObjectByName('buttonHand');
    this.originalXPositionGrip = buttonMeshes.grip.position.x;
    buttonMeshes.thumbstick = controllerObject3D.getObjectByName('stick');
    buttonMeshes.trigger = controllerObject3D.getObjectByName('buttonTrigger');
    this.originalXRotationTrigger = buttonMeshes.trigger.rotation.x;
    buttonMeshes.xbutton = controllerObject3D.getObjectByName('buttonX');
    buttonMeshes.abutton = controllerObject3D.getObjectByName('buttonA');
    buttonMeshes.ybutton = controllerObject3D.getObjectByName('buttonY');
    buttonMeshes.bbutton = controllerObject3D.getObjectByName('buttonB');

    var thumbstick = buttonMeshes.thumbstick;
    var thumbstickParent = thumbstick.parent;
    // Attach thumbstick to pivot group to center the pivot point properly.
    thumbstickParent.remove(thumbstick);

    var thumbstickBoundingBox = new THREE.Box3().setFromObject(thumbstick);
    thumbstickBoundingBox.getCenter(thumbstick.position);

    // tweak thumbstick down into the controller body a little to improve aesthetics.
    var thumbstickPosTweak = 0.002;
    thumbstick.position.y -= thumbstickPosTweak;
    thumbstick.position.z += thumbstickPosTweak / 6.5;

    var thumbstickPivot = new THREE.Group();
    thumbstickParent.add(thumbstickPivot);
    thumbstickPivot.add(thumbstick);

    thumbstick.geometry.center();

    this.originalXRotationThumbstick = thumbstick.rotation.x;
    this.originalYRotationThumbstick = thumbstick.rotation.y;
    this.originalZRotationThumbstick = thumbstick.rotation.z;

    this.el.emit('controllermodelready', {
      name: 'oculus-touch-controls',
      model: this.data.model,
      rayOrigin: RAY_ORIGIN[this.data.hand]
    });
  },

  onAxisMoved: function (evt) {
    this.emitIfAxesChanged(this, this.mapping[this.data.hand].axes, evt);
  },

  onThumbstickMoved: function (evt) {
    var buttonMeshes = this.buttonMeshes;
    var thumbstick = (buttonMeshes && buttonMeshes.thumbstick) ? buttonMeshes.thumbstick : null;
    var analogValueX, analogValueY;
    var maxRot = Math.PI / 180.0 * 24.0;

    analogValueX = evt.detail.x;
    analogValueY = evt.detail.y;

    if (thumbstick) {
      // up-down axis
      buttonMeshes.thumbstick.rotation.x = this.originalXRotationThumbstick + analogValueY * maxRot;
      // left-right axis
      // Note: oculus controller face is angled at approx 30-deg angle, thus a 5 to 3 ratio.
      var axis = new THREE.Vector3(0, 3, -5).normalize();
      buttonMeshes.thumbstick.rotation.y = this.originalYRotationThumbstick;
      buttonMeshes.thumbstick.rotation.z = this.originalZRotationThumbstick;
      buttonMeshes.thumbstick.rotateOnAxis(axis, -analogValueX * maxRot);
    }
  },

  updateModel: function (buttonName, evtName) {
    if (!this.data.model) { return; }
    this.updateButtonModel(buttonName, evtName);
  },

  updateButtonModel: function (buttonName, state) {
    var color = (state === 'up' || state === 'touchend') ? this.data.buttonColor : state === 'touchstart' ? this.data.buttonTouchColor : this.data.buttonHighlightColor;
    var buttonMeshes = this.buttonMeshes;
    if (!this.data.model) { return; }
    if (buttonMeshes && buttonMeshes[buttonName]) {
      buttonMeshes[buttonName].material.color.set(color);
    }
  }
});
