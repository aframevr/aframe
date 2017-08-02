var bind = require('../utils/bind');
var registerComponent = require('../core/component').registerComponent;
var controllerUtils = require('../utils/tracked-controls');
var utils = require('../utils/');

var debug = utils.debug('components:windows-motion-controls:debug');
var warn = utils.debug('components:windows-motion-controls:warn');

// TODO: Point to final glb assets once they are hosted. For now, place them in this hard coded directory.
var MODEL_BASE_URL = '/examples/assets/models/controllers/wmr/';
var MODEL_LEFT_FILENAME = 'left.glb';
var MODEL_RIGHT_FILENAME = 'right.glb';
var MODEL_UNIVERSAL_FILENAME = 'universal.glb';

var GAMEPAD_ID_PREFIX = 'Spatial Controller (Spatial Interaction Source) ';
var GAMEPAD_ID_PATTERN = /([0-9a-zA-Z]+-[0-9a-zA-Z]+)$/;

/**
 * Windows Motion Controller Controls Component
 * Interfaces with Windows Motion Controller controllers and maps Gamepad events to
 * common controller buttons: trackpad, trigger, grip, menu and system
 * It loads a controller model and transforms the pressed buttons
 */
module.exports.Component = registerComponent('windows-motion-controls', {
  schema: {
    hand: {default: 'left'},
    // If true, loads the controller glTF asset.
    model: {default: true},
    // If true, will hide the model from the scene if no matching gamepad (based on ID & hand) is connected.
    hideDisconnected: {default: true}
  },

  _mapping: {
    // A-Frame specific semantic axis names
    axes: {'thumbstick': [0, 1], 'trackpad': [2, 3]},
    // A-Frame specific semantic button names
    buttons: ['thumbstick', 'trigger', 'grip', 'menu', 'trackpad'],
    // A mapping of the semantic name to node name in the glTF model file,
    // that should be transformed by axis value.
    // This array mirrors the browser Gamepad.axes array, such that
    // the mesh corresponding to axis 0 is in this array index 0.
    axisMeshNames: [
      'THUMBSTICK_X',
      'THUMBSTICK_Y',
      'TOUCHPAD_TOUCH_X',
      'TOUCHPAD_TOUCH_Y'
    ],
    // A mapping of the semantic name to button node name in the glTF model file,
    // that should be transformed by button value.
    buttonMeshNames: {
      'trigger': 'SELECT',
      'menu': 'MENU',
      'grip': 'GRASP',
      'thumbstick': 'THUMBSTICK_PRESS',
      'trackpad': 'TOUCHPAD_PRESS'
    }
  },

  bindMethods: function () {
    this.onModelError = bind(this.onModelError, this);
    this.onModelLoaded = bind(this.onModelLoaded, this);
    this.onControllersUpdate = bind(this.onControllersUpdate, this);
    this.checkIfControllerPresent = bind(this.checkIfControllerPresent, this);
    this.onAxisMoved = bind(this.onAxisMoved, this);
  },

  init: function () {
    var self = this;
    this.onButtonChanged = bind(this.onButtonChanged, this);
    this.onButtonDown = function (evt) { self.onButtonEvent(evt, 'down'); };
    this.onButtonUp = function (evt) { self.onButtonEvent(evt, 'up'); };
    this.onButtonTouchStart = function (evt) { self.onButtonEvent(evt, 'touchstart'); };
    this.onButtonTouchEnd = function (evt) { self.onButtonEvent(evt, 'touchend'); };
    this.controllerPresent = false;
    this.lastControllerCheck = 0;
    this.previousButtonValues = {};
    this.bindMethods();

    // Cache for submeshes that we have looked up by name.
    this._loadedMeshInfo = {
      buttonMeshes: null,
      axisMeshes: null
    };

    // Stored on object to allow for mocking in tests
    this.emitIfAxesChanged = controllerUtils.emitIfAxesChanged;
    this.checkControllerPresentAndSetup = controllerUtils.checkControllerPresentAndSetup;
  },

  addEventListeners: function () {
    var el = this.el;
    el.addEventListener('buttonchanged', this.onButtonChanged);
    el.addEventListener('buttondown', this.onButtonDown);
    el.addEventListener('buttonup', this.onButtonUp);
    el.addEventListener('touchstart', this.onButtonTouchStart);
    el.addEventListener('touchend', this.onButtonTouchEnd);
    el.addEventListener('axismove', this.onAxisMoved);
    el.addEventListener('model-error', this.onModelError);
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
    el.removeEventListener('model-error', this.onModelError);
    el.removeEventListener('model-loaded', this.onModelLoaded);
    this.controllerEventsActive = false;
  },

  checkIfControllerPresent: function () {
    this.checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {
      hand: this.data.hand
    });

    if (this.data.hideDisconnected) {
      this.el.setAttribute('visible', this.controllerPresent);
    }
  },

  play: function () {
    this.checkIfControllerPresent();
    this.addControllersUpdateListener();

    window.addEventListener('gamepadconnected', this.checkIfControllerPresent, false);
    window.addEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
  },

  pause: function () {
    this.removeEventListeners();
    this.removeControllersUpdateListener();

    window.removeEventListener('gamepadconnected', this.checkIfControllerPresent, false);
    window.removeEventListener('gamepaddisconnected', this.checkIfControllerPresent, false);
  },

  updateControllerModel: function () {
    if (!this.data.model || this.el.getAttribute('gltf-model')) { return; }

    var sourceUrl = this.createControllerModelUrl();
    this.loadModel(sourceUrl);
  },

  /**
   * Helper function that constructs a URL from the controller ID suffix, for future proofed
   * art assets.
   */
  createControllerModelUrl: function (forceDefault) {
    // Determine the device specific folder based on the ID suffix
    var trackedControlsComponent = this.el.components['tracked-controls'];
    var controller = trackedControlsComponent ? trackedControlsComponent.controller : null;
    var device = 'default';
    var hand = this.data.hand;

    if (controller) {
      // Read hand directly from the controller, rather than this.data, as in the case that the controller
      // is unhanded this.data will still have 'left' or 'right' (depending on what the user inserted in to the scene).
      // In this case, we want to load the universal model, so need to get the '' from the controller.
      hand = controller.hand;

      if (!forceDefault) {
        var match = controller.id.match(GAMEPAD_ID_PATTERN);
        device = ((match && match[0]) || device);
      }
    }

    // Hand
    var filename;
    if (hand === 'left') filename = MODEL_LEFT_FILENAME;
    else if (hand === 'right') filename = MODEL_RIGHT_FILENAME;
    else filename = MODEL_UNIVERSAL_FILENAME;

    // Final url
    return MODEL_BASE_URL + device + '/' + filename;
  },

  injectTrackedControls: function () {
    var data = this.data;
    this.el.setAttribute('tracked-controls', {
      idPrefix: GAMEPAD_ID_PREFIX,
      hand: data.hand
    });

    this.updateControllerModel();
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

  onModelError: function (evt) {
    var defaultUrl = this.createControllerModelUrl(true);
    if (evt.detail.src !== defaultUrl) {
      warn('Failed to load controller model for device, attempting to load default.');
      this.loadModel(defaultUrl);
    } else {
      warn('Failed to load default controller model.');
    }
  },

  loadModel: function (url) {
    debug('Loading asset from: ' + url);

    // The model is loaded by the gltf-model compoent when this attribute is initially set,
    // removed and re-loaded if the given url changes.
    this.el.setAttribute('gltf-model', 'url(' + url + ')');
  },

  onModelLoaded: function (evt) {
    var controllerObject3D = evt.detail.model;
    var loadedMeshInfo = this._loadedMeshInfo;
    var i;

    debug('Processing model');

    // Find the appropriate nodes
    var rootNode = controllerObject3D.getObjectByName('RootNode');

    // Reset the caches
    loadedMeshInfo.buttonMeshes = {};
    loadedMeshInfo.axisMeshes = {};

    // Cache our meshes so we aren't traversing the hierarchy per frame
    if (rootNode) {
      // Button Meshes
      for (i = 0; i < this._mapping.buttons.length; i++) {
        var buttonMeshName = this._mapping.buttonMeshNames[this._mapping.buttons[i]];
        if (!buttonMeshName) {
          debug('Skipping unknown button at index: ' + i + ' with mapped name: ' + this._mapping.buttons[i]);
          continue;
        }

        var buttonMesh = rootNode.getObjectByName(buttonMeshName);
        if (!buttonMesh) {
          warn('Missing button mesh with name: ' + buttonMeshName);
          continue;
        }

        var buttonMeshInfo = {
          index: i,
          value: getImmediateChildByName(buttonMesh, 'VALUE'),
          pressed: getImmediateChildByName(buttonMesh, 'PRESSED'),
          unpressed: getImmediateChildByName(buttonMesh, 'UNPRESSED')
        };
        if (buttonMeshInfo.value && buttonMeshInfo.pressed && buttonMeshInfo.unpressed) {
          loadedMeshInfo.buttonMeshes[this._mapping.buttons[i]] = buttonMeshInfo;
        } else {
          // If we didn't find the mesh, it simply means this button won't have transforms applied as mapped button value changes.
          warn('Missing button submesh under mesh with name: ' + buttonMeshName +
            '(VALUE: ' + !!buttonMeshInfo.value +
            ', PRESSED: ' + !!buttonMeshInfo.pressed +
            ', UNPRESSED:' + !!buttonMeshInfo.unpressed +
            ')');
        }
      }

      // Axis Meshes
      for (i = 0; i < this._mapping.axisMeshNames.length; i++) {
        var axisMeshName = this._mapping.axisMeshNames[i];
        if (!axisMeshName) {
          debug('Skipping unknown axis at index: ' + i);
          continue;
        }

        var axisMesh = rootNode.getObjectByName(axisMeshName);
        if (!axisMesh) {
          warn('Missing axis mesh with name: ' + axisMeshName);
          continue;
        }

        var axisMeshInfo = {
          index: i,
          value: getImmediateChildByName(axisMesh, 'VALUE'),
          min: getImmediateChildByName(axisMesh, 'MIN'),
          max: getImmediateChildByName(axisMesh, 'MAX')
        };
        if (axisMeshInfo.value && axisMeshInfo.min && axisMeshInfo.max) {
          loadedMeshInfo.axisMeshes[i] = axisMeshInfo;
        } else {
          // If we didn't find the mesh, it simply means this axis won't have transforms applied as mapped axis values change.
          warn('Missing axis submesh under mesh with name: ' + axisMeshName +
            '(VALUE: ' + !!axisMeshInfo.value +
            ', MIN: ' + !!axisMeshInfo.min +
            ', MAX:' + !!axisMeshInfo.max +
            ')');
        }
      }
    } else {
      warn('No node with name "RootNode" in controller glTF.');
    }

    debug('Model load complete.');

    // Look through only immediate children. This will return null if no mesh exists with the given name.
    function getImmediateChildByName (object3d, value) {
      for (var i = 0, l = object3d.children.length; i < l; i++) {
        var obj = object3d.children[i];
        if (obj && obj['name'] === value) {
          return obj;
        }
      }
      return undefined;
    }
  },

  lerpAxisTransform: function (axis, axisValue) {
    var axisMeshInfo = this._loadedMeshInfo.axisMeshes[axis];
    if (!axisMeshInfo) return;

    var min = axisMeshInfo.min;
    var max = axisMeshInfo.max;
    var target = axisMeshInfo.value;

    // Convert from gamepad value range (-1 to +1) to lerp range (0 to 1)
    var lerpValue = axisValue * 0.5 + 0.5;
    target.setRotationFromQuaternion(min.quaternion.clone().slerp(max.quaternion, lerpValue));
    target.position.lerpVectors(min.position, max.position, lerpValue);
  },

  lerpButtonTransform: function (buttonName, buttonValue) {
    var buttonMeshInfo = this._loadedMeshInfo.buttonMeshes[buttonName];
    if (!buttonMeshInfo) return;

    var min = buttonMeshInfo.unpressed;
    var max = buttonMeshInfo.pressed;
    var target = buttonMeshInfo.value;

    target.setRotationFromQuaternion(min.quaternion.clone().slerp(max.quaternion, buttonValue));
    target.position.lerpVectors(min.position, max.position, buttonValue);
  },

  onButtonChanged: function (evt) {
    var buttonName = this._mapping.buttons[evt.detail.id];

    if (buttonName) {
      // Update the button mesh transform
      if (this._loadedMeshInfo && this._loadedMeshInfo.buttonMeshes) {
        this.lerpButtonTransform(buttonName, evt.detail.state.value);
      }

      // Only emit events for buttons that we know how to map from index to name
      this.el.emit(buttonName + 'changed', evt.detail.state);
    }
  },

  onButtonEvent: function (evt, evtName) {
    var buttonName = this._mapping.buttons[evt.detail.id];
    debug('onButtonEvent(' + evt.detail.id + ', ' + evtName + ')');

    if (buttonName) {
      // Only emit events for buttons that we know how to map from index to name
      this.el.emit(buttonName + evtName);
    }
  },

  onAxisMoved: function (evt) {
    var numAxes = this._mapping.axisMeshNames.length;

    // Only attempt to update meshes if we have valid data.
    if (this._loadedMeshInfo && this._loadedMeshInfo.axisMeshes) {
      for (var axis = 0; axis < numAxes; axis++) {
        // Update the button mesh transform
        this.lerpAxisTransform(axis, evt.detail.axis[axis] || 0.0);
      }
    }

    this.emitIfAxesChanged(this, this._mapping.axes, evt);
  }
});
