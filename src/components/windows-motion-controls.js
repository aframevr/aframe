import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
import * as utils from '../utils/index.js';
import { DEFAULT_HANDEDNESS, AFRAME_CDN_ROOT } from '../constants/index.js';
import { checkControllerPresentAndSetup, emitIfAxesChanged, onButtonEvent } from '../utils/tracked-controls.js';

var debug = utils.debug('components:windows-motion-controls:debug');
var warn = utils.debug('components:windows-motion-controls:warn');

var MODEL_BASE_URL = AFRAME_CDN_ROOT + 'controllers/microsoft/';
var MODEL_FILENAMES = { left: 'left.glb', right: 'right.glb', default: 'universal.glb' };

var GAMEPAD_ID_PREFIX = 'windows-mixed-reality';

var INPUT_MAPPING = {
  // A-Frame specific semantic axis names
  axes: {'touchpad': [0, 1], 'thumbstick': [2, 3]},
  // A-Frame specific semantic button names
  buttons: ['trigger', 'squeeze', 'touchpad', 'thumbstick', 'menu'],
  // A mapping of the semantic name to node name in the glTF model file,
  // that should be transformed by axis value.
  // This array mirrors the browser Gamepad.axes array, such that
  // the mesh corresponding to axis 0 is in this array index 0.
  axisMeshNames: [
    'TOUCHPAD_TOUCH_X',
    'TOUCHPAD_TOUCH_Y',
    'THUMBSTICK_X',
    'THUMBSTICK_Y'
  ],
  // A mapping of the semantic name to button node name in the glTF model file,
  // that should be transformed by button value.
  buttonMeshNames: {
    'trigger': 'SELECT',
    'menu': 'MENU',
    'squeeze': 'GRASP',
    'thumbstick': 'THUMBSTICK_PRESS',
    'touchpad': 'TOUCHPAD_PRESS'
  },
  pointingPoseMeshName: 'POINTING_POSE'
};

/**
 * Windows Motion Controller controls.
 * Interface with Windows Motion Controller controllers and map Gamepad events to
 * controller buttons: trackpad, trigger, grip, menu, thumbstick
 * Load a controller model and transform the pressed buttons.
 */
export var Component = registerComponent('windows-motion-controls', {
  schema: {
    hand: {default: DEFAULT_HANDEDNESS},
    // It is possible to have multiple pairs of controllers attached (a pair has both left and right).
    // Set this to 1 to use a controller from the second pair, 2 from the third pair, etc.
    pair: {default: 0},
    // If true, loads the controller glTF asset.
    model: {default: true}
  },

  after: ['tracked-controls'],

  mapping: INPUT_MAPPING,

  bindMethods: function () {
    this.onModelError = this.onModelError.bind(this);
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onControllersUpdate = this.onControllersUpdate.bind(this);
    this.checkIfControllerPresent = this.checkIfControllerPresent.bind(this);
    this.onAxisMoved = this.onAxisMoved.bind(this);
  },

  init: function () {
    var self = this;
    var el = this.el;
    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self); };
    this.onControllerConnected = function () { self.setModelVisibility(true); };
    this.onControllerDisconnected = function () { self.setModelVisibility(false); };
    this.controllerPresent = false;
    this.previousButtonValues = {};
    this.bindMethods();

    // Cache for submeshes that we have looked up by name.
    this.loadedMeshInfo = {
      buttonMeshes: null,
      axisMeshes: null
    };

    // Pointing poses
    this.rayOrigin = {
      origin: new THREE.Vector3(),
      direction: new THREE.Vector3(0, 0, -1),
      createdFromMesh: false
    };

    el.addEventListener('controllerconnected', this.onControllerConnected);
    el.addEventListener('controllerdisconnected', this.onControllerDisconnected);
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
    checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {
      hand: this.data.hand,
      index: this.data.pair,
      iterateControllerProfiles: true
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

  updateControllerModel: function () {
    // If we do not want to load a model, or, have already loaded the model, emit the controllermodelready event.
    if (!this.data.model || this.rayOrigin.createdFromMesh) {
      this.modelReady();
      return;
    }

    var sourceUrl = this.createControllerModelUrl();
    this.loadModel(sourceUrl);
  },

  /**
   * Helper function that constructs a URL from the controller ID suffix, for future proofed
   * art assets.
   */
  createControllerModelUrl: function (forceDefault) {
    // Determine the device specific folder based on the ID suffix
    var device = 'default';
    var hand = this.data.hand;
    var filename;

    // Hand
    filename = MODEL_FILENAMES[hand] || MODEL_FILENAMES.default;

    // Final url
    return MODEL_BASE_URL + device + '/' + filename;
  },

  injectTrackedControls: function () {
    var data = this.data;
    this.el.setAttribute('tracked-controls', {
      idPrefix: GAMEPAD_ID_PREFIX,
      controller: data.pair,
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
    // The model is loaded by the gltf-model component when this attribute is initially set,
    // removed and re-loaded if the given url changes.
    this.el.setAttribute('gltf-model', 'url(' + url + ')');
  },

  onModelLoaded: function (evt) {
    var rootNode = this.controllerModel = evt.detail.model;
    var loadedMeshInfo = this.loadedMeshInfo;
    var i;
    var meshName;
    var mesh;
    var meshInfo;

    if (evt.target !== this.el) { return; }

    debug('Processing model');

    // Reset the caches
    loadedMeshInfo.buttonMeshes = {};
    loadedMeshInfo.axisMeshes = {};

    // Cache our meshes so we aren't traversing the hierarchy per frame
    if (rootNode) {
      // Button Meshes
      for (i = 0; i < this.mapping.buttons.length; i++) {
        meshName = this.mapping.buttonMeshNames[this.mapping.buttons[i]];
        if (!meshName) {
          debug('Skipping unknown button at index: ' + i + ' with mapped name: ' + this.mapping.buttons[i]);
          continue;
        }

        mesh = rootNode.getObjectByName(meshName);
        if (!mesh) {
          warn('Missing button mesh with name: ' + meshName);
          continue;
        }

        meshInfo = {
          index: i,
          value: getImmediateChildByName(mesh, 'VALUE'),
          pressed: getImmediateChildByName(mesh, 'PRESSED'),
          unpressed: getImmediateChildByName(mesh, 'UNPRESSED')
        };
        if (meshInfo.value && meshInfo.pressed && meshInfo.unpressed) {
          loadedMeshInfo.buttonMeshes[this.mapping.buttons[i]] = meshInfo;
        } else {
          // If we didn't find the mesh, it simply means this button won't have transforms applied as mapped button value changes.
          warn('Missing button submesh under mesh with name: ' + meshName +
            '(VALUE: ' + !!meshInfo.value +
            ', PRESSED: ' + !!meshInfo.pressed +
            ', UNPRESSED:' + !!meshInfo.unpressed +
            ')');
        }
      }

      // Axis Meshes
      for (i = 0; i < this.mapping.axisMeshNames.length; i++) {
        meshName = this.mapping.axisMeshNames[i];
        if (!meshName) {
          debug('Skipping unknown axis at index: ' + i);
          continue;
        }

        mesh = rootNode.getObjectByName(meshName);
        if (!mesh) {
          warn('Missing axis mesh with name: ' + meshName);
          continue;
        }

        meshInfo = {
          index: i,
          value: getImmediateChildByName(mesh, 'VALUE'),
          min: getImmediateChildByName(mesh, 'MIN'),
          max: getImmediateChildByName(mesh, 'MAX')
        };
        if (meshInfo.value && meshInfo.min && meshInfo.max) {
          loadedMeshInfo.axisMeshes[i] = meshInfo;
        } else {
          // If we didn't find the mesh, it simply means this axis won't have transforms applied as mapped axis values change.
          warn('Missing axis submesh under mesh with name: ' + meshName +
            '(VALUE: ' + !!meshInfo.value +
            ', MIN: ' + !!meshInfo.min +
            ', MAX:' + !!meshInfo.max +
            ')');
        }
      }

      this.calculateRayOriginFromMesh(rootNode);
      // Determine if the model has to be visible or not.
      this.setModelVisibility();
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

  calculateRayOriginFromMesh: (function () {
    var quaternion = new THREE.Quaternion();
    return function (rootNode) {
      var mesh;

      // Calculate the pointer pose (used for rays), by applying the world transform of th POINTER_POSE node
      // in the glTF (assumes that root node is at world origin)
      this.rayOrigin.origin.set(0, 0, 0);
      this.rayOrigin.direction.set(0, 0, -1);
      this.rayOrigin.createdFromMesh = true;

      // Try to read Pointing pose from the source model
      mesh = rootNode.getObjectByName(this.mapping.pointingPoseMeshName);
      if (mesh) {
        var parent = rootNode.parent;

        // We need to read pose transforms accumulated from the root of the glTF, not the scene.
        if (parent) {
          rootNode.parent = null;
          rootNode.updateMatrixWorld(true);
          rootNode.parent = parent;
        }

        mesh.getWorldPosition(this.rayOrigin.origin);
        mesh.getWorldQuaternion(quaternion);
        this.rayOrigin.direction.applyQuaternion(quaternion);

        // Recalculate the world matrices now that the rootNode is re-attached to the parent.
        if (parent) {
          rootNode.updateMatrixWorld(true);
        }
      } else {
        debug('Mesh does not contain pointing origin data, defaulting to none.');
      }

      // Emit event stating that our pointing ray is now accurate.
      this.modelReady();
    };
  })(),

  lerpAxisTransform: (function () {
    var quaternion = new THREE.Quaternion();
    return function (axis, axisValue) {
      var axisMeshInfo = this.loadedMeshInfo.axisMeshes[axis];
      if (!axisMeshInfo) return;

      var min = axisMeshInfo.min;
      var max = axisMeshInfo.max;
      var target = axisMeshInfo.value;

      // Convert from gamepad value range (-1 to +1) to lerp range (0 to 1)
      var lerpValue = axisValue * 0.5 + 0.5;
      target.setRotationFromQuaternion(quaternion.copy(min.quaternion).slerp(max.quaternion, lerpValue));
      target.position.lerpVectors(min.position, max.position, lerpValue);
    };
  })(),

  lerpButtonTransform: (function () {
    var quaternion = new THREE.Quaternion();
    return function (buttonName, buttonValue) {
      var buttonMeshInfo = this.loadedMeshInfo.buttonMeshes[buttonName];
      if (!buttonMeshInfo) return;

      var min = buttonMeshInfo.unpressed;
      var max = buttonMeshInfo.pressed;
      var target = buttonMeshInfo.value;

      target.setRotationFromQuaternion(quaternion.copy(min.quaternion).slerp(max.quaternion, buttonValue));
      target.position.lerpVectors(min.position, max.position, buttonValue);
    };
  })(),

  modelReady: function () {
    this.el.emit('controllermodelready', {
      name: 'windows-motion-controls',
      model: this.data.model,
      rayOrigin: this.rayOrigin
    });
  },

  onButtonChanged: function (evt) {
    var buttonName = this.mapping.buttons[evt.detail.id];

    if (buttonName) {
      // Update the button mesh transform
      if (this.loadedMeshInfo && this.loadedMeshInfo.buttonMeshes) {
        this.lerpButtonTransform(buttonName, evt.detail.state.value);
      }

      // Only emit events for buttons that we know how to map from index to name
      this.el.emit(buttonName + 'changed', evt.detail.state);
    }
  },

  onAxisMoved: function (evt) {
    var numAxes = this.mapping.axisMeshNames.length;

    // Only attempt to update meshes if we have valid data.
    if (this.loadedMeshInfo && this.loadedMeshInfo.axisMeshes) {
      for (var axis = 0; axis < numAxes; axis++) {
        // Update the button mesh transform
        this.lerpAxisTransform(axis, evt.detail.axis[axis] || 0.0);
      }
    }

    emitIfAxesChanged(this, this.mapping.axes, evt);
  },

  setModelVisibility: function (visible) {
    var model = this.el.getObject3D('mesh');
    if (!this.controllerPresent) { return; }
    visible = visible !== undefined ? visible : this.modelVisible;
    this.modelVisible = visible;
    if (!model) { return; }
    model.visible = visible;
  }
});
