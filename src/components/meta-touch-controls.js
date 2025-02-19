import * as THREE from 'three';
import { registerComponent } from '../core/component.js';
import { AFRAME_CDN_ROOT } from '../constants/index.js';
import { checkControllerPresentAndSetup, emitIfAxesChanged, onButtonEvent } from '../utils/tracked-controls.js';

// Prefix for Gen1 and Gen2 Oculus Touch Controllers.
var GAMEPAD_ID_PREFIX = 'oculus-touch';

// First generation model URL.
var TOUCH_CONTROLLER_MODEL_BASE_URL = AFRAME_CDN_ROOT + 'controllers/oculus/oculus-touch-controller-';
var META_CONTROLLER_MODEL_BASE_URL = AFRAME_CDN_ROOT + 'controllers/meta/';

var OCULUS_TOUCH_CONFIG = {
  left: {
    modelUrl: TOUCH_CONTROLLER_MODEL_BASE_URL + 'left.gltf',
    rayOrigin: {origin: {x: 0.002, y: -0.005, z: -0.03}, direction: {x: 0, y: -0.8, z: -1}},
    modelPivotOffset: new THREE.Vector3(-0.005, 0.036, -0.037),
    modelPivotRotation: new THREE.Euler(Math.PI / 4.5, 0, 0)
  },
  right: {
    modelUrl: TOUCH_CONTROLLER_MODEL_BASE_URL + 'right.gltf',
    rayOrigin: {origin: {x: -0.002, y: -0.005, z: -0.03}, direction: {x: 0, y: -0.8, z: -1}},
    modelPivotOffset: new THREE.Vector3(0.005, 0.036, -0.037),
    modelPivotRotation: new THREE.Euler(Math.PI / 4.5, 0, 0)
  }
};

var CONTROLLER_DEFAULT = 'oculus-touch';
var CONTROLLER_PROPERTIES = {
  'oculus-touch': OCULUS_TOUCH_CONFIG,
  'oculus-touch-v2': {
    left: {
      modelUrl: TOUCH_CONTROLLER_MODEL_BASE_URL + 'gen2-left.gltf',
      rayOrigin: {origin: {x: -0.006, y: -0.03, z: -0.04}, direction: {x: 0, y: -0.9, z: -1}},
      modelPivotOffset: new THREE.Vector3(0, -0.007, -0.021),
      modelPivotRotation: new THREE.Euler(-Math.PI / 4, 0, 0)
    },
    right: {
      modelUrl: TOUCH_CONTROLLER_MODEL_BASE_URL + 'gen2-right.gltf',
      rayOrigin: {origin: {x: 0.006, y: -0.03, z: -0.04}, direction: {x: 0, y: -0.9, z: -1}},
      modelPivotOffset: new THREE.Vector3(0, -0.007, -0.021),
      modelPivotRotation: new THREE.Euler(-Math.PI / 4, 0, 0)
    }
  },
  'oculus-touch-v3': {
    left: {
      modelUrl: TOUCH_CONTROLLER_MODEL_BASE_URL + 'v3-left.glb',
      rayOrigin: {
        origin: {x: 0.0065, y: -0.0186, z: -0.05},
        direction: {x: 0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814}
      },
      modelPivotOffset: new THREE.Vector3(0, 0, 0),
      modelPivotRotation: new THREE.Euler(0, 0, 0)
    },
    right: {
      modelUrl: TOUCH_CONTROLLER_MODEL_BASE_URL + 'v3-right.glb',
      rayOrigin: {
        origin: {x: -0.0065, y: -0.0186, z: -0.05},
        direction: {x: -0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814}
      },
      modelPivotOffset: new THREE.Vector3(0, 0, 0),
      modelPivotRotation: new THREE.Euler(0, 0, 0)
    }
  },
  'meta-quest-touch-pro': {
    left: {
      modelUrl: META_CONTROLLER_MODEL_BASE_URL + 'quest-touch-pro-left.glb',
      rayOrigin: {
        origin: {x: 0.0065, y: -0.0186, z: -0.05},
        direction: {x: 0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814}
      },
      modelPivotOffset: new THREE.Vector3(0, 0, 0),
      modelPivotRotation: new THREE.Euler(0, 0, 0)
    },
    right: {
      modelUrl: META_CONTROLLER_MODEL_BASE_URL + 'quest-touch-pro-right.glb',
      rayOrigin: {
        origin: {x: -0.0065, y: -0.0186, z: -0.05},
        direction: {x: -0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814}
      },
      modelPivotOffset: new THREE.Vector3(0, 0, 0),
      modelPivotRotation: new THREE.Euler(0, 0, 0)
    }
  },
  'meta-quest-touch-plus': {
    left: {
      modelUrl: META_CONTROLLER_MODEL_BASE_URL + 'quest-touch-plus-left.glb',
      rayOrigin: {
        origin: {x: 0.0065, y: -0.0186, z: -0.05},
        direction: {x: 0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814}
      },
      modelPivotOffset: new THREE.Vector3(0, 0, 0),
      modelPivotRotation: new THREE.Euler(0, 0, 0)
    },
    right: {
      modelUrl: META_CONTROLLER_MODEL_BASE_URL + 'quest-touch-plus-right.glb',
      rayOrigin: {
        origin: {x: -0.0065, y: -0.0186, z: -0.05},
        direction: {x: -0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814}
      },
      modelPivotOffset: new THREE.Vector3(0, 0, 0),
      modelPivotRotation: new THREE.Euler(0, 0, 0)
    }
  }
};

var INPUT_MAPPING = {
  left: {
    axes: {thumbstick: [2, 3]},
    buttons: ['trigger', 'grip', 'none', 'thumbstick', 'xbutton', 'ybutton', 'surface']
  },
  right: {
    axes: {thumbstick: [2, 3]},
    buttons: ['trigger', 'grip', 'none', 'thumbstick', 'abutton', 'bbutton', 'surface']
  }
};

/**
 * Meta Touch controls (formerly Oculus Touch)
 * Interface with Meta Touch controllers and map Gamepad events to
 * controller buttons: thumbstick, trigger, grip, xbutton, ybutton, surface
 * Load a controller model and highlight the pressed buttons.
 */
var componentConfig = {
  schema: {
    hand: {default: 'left'},
    buttonColor: {type: 'color', default: '#999'},  // Off-white.
    buttonTouchColor: {type: 'color', default: '#8AB'},
    buttonHighlightColor: {type: 'color', default: '#2DF'},  // Light blue.
    model: {default: true},
    controllerType: {default: 'auto', oneOf: ['auto', 'oculus-touch', 'oculus-touch-v2', 'oculus-touch-v3']}
  },

  after: ['tracked-controls'],

  mapping: INPUT_MAPPING,

  bindMethods: function () {
    this.onButtonChanged = this.onButtonChanged.bind(this);
    this.onThumbstickMoved = this.onThumbstickMoved.bind(this);
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onControllersUpdate = this.onControllersUpdate.bind(this);
    this.checkIfControllerPresent = this.checkIfControllerPresent.bind(this);
    this.onAxisMoved = this.onAxisMoved.bind(this);
  },

  init: function () {
    var self = this;
    this.onButtonDown = function (evt) { onButtonEvent(evt.detail.id, 'down', self, self.data.hand); };
    this.onButtonUp = function (evt) { onButtonEvent(evt.detail.id, 'up', self, self.data.hand); };
    this.onButtonTouchStart = function (evt) { onButtonEvent(evt.detail.id, 'touchstart', self, self.data.hand); };
    this.onButtonTouchEnd = function (evt) { onButtonEvent(evt.detail.id, 'touchend', self, self.data.hand); };
    this.controllerPresent = false;
    this.previousButtonValues = {};
    this.bindMethods();
    this.triggerEuler = new THREE.Euler();
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
    var controllerObject3D = this.controllerObject3D;
    if (controllerObject3D) { controllerObject3D.visible = false; }
    checkControllerPresentAndSetup(this, GAMEPAD_ID_PREFIX, {
      hand: this.data.hand,
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

  loadModel: function (controller) {
    var data = this.data;
    var controllerId;
    if (!data.model) { return; }

    // If model has been already loaded
    if (this.controllerObject3D) {
      this.controllerObject3D.visible = true;
      this.el.setObject3D('mesh', this.controllerObject3D);
      return;
    }

    // Set the controller display model based on the data passed in.
    this.displayModel = CONTROLLER_PROPERTIES[data.controllerType] || CONTROLLER_PROPERTIES[CONTROLLER_DEFAULT];
    // If the developer is asking for auto-detection, use the retrieved displayName to identify the specific unit.
    if (data.controllerType === 'auto') {
      controllerId = CONTROLLER_DEFAULT;
      var controllersPropertiesIds = Object.keys(CONTROLLER_PROPERTIES);
      for (var i = 0; i < controller.profiles.length; i++) {
        if (controllersPropertiesIds.indexOf(controller.profiles[i]) !== -1) {
          controllerId = controller.profiles[i];
          break;
        }
      }
      this.displayModel = CONTROLLER_PROPERTIES[controllerId];
    }
    var modelUrl = this.displayModel[data.hand].modelUrl;
    this.isTouchV3orPROorPlus =
      this.displayModel === CONTROLLER_PROPERTIES['oculus-touch-v3'] ||
      this.displayModel === CONTROLLER_PROPERTIES['meta-quest-touch-pro'] ||
      this.displayModel === CONTROLLER_PROPERTIES['meta-quest-touch-plus'];
    this.el.setAttribute('gltf-model', modelUrl);
  },

  injectTrackedControls: function (controller) {
    var data = this.data;
    var id = GAMEPAD_ID_PREFIX;
    this.el.setAttribute('tracked-controls', {
      id: id,
      hand: data.hand,
      handTrackingEnabled: false,
      iterateControllerProfiles: true
    });
    this.loadModel(controller);
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
    if (!button) { return; }
    // move the button meshes
    if (this.isTouchV3orPROorPlus) {
      this.onButtonChangedV3orPROorPlus(evt);
    } else {
      var buttonMeshes = this.buttonMeshes;
      var analogValue;

      if (button === 'trigger' || button === 'grip') { analogValue = evt.detail.state.value; }

      if (buttonMeshes) {
        if (button === 'trigger' && buttonMeshes.trigger) {
          buttonMeshes.trigger.rotation.x = this.originalXRotationTrigger - analogValue * (Math.PI / 26);
        }
        if (button === 'grip' && buttonMeshes.grip) {
          analogValue *= this.data.hand === 'left' ? -1 : 1;
          buttonMeshes.grip.position.x = this.originalXPositionGrip + analogValue * 0.004;
        }
      }
    }
    // Pass along changed event with button state, using the button mapping for convenience.
    this.el.emit(button + 'changed', evt.detail.state);
  },

  onButtonChangedV3orPROorPlus: function (evt) {
    var button = this.mapping[this.data.hand].buttons[evt.detail.id];
    var buttonObjects = this.buttonObjects;
    var analogValue;
    if (!buttonObjects || !buttonObjects[button]) { return; }
    analogValue = evt.detail.state.value;
    buttonObjects[button].quaternion.slerpQuaternions(
      this.buttonRanges[button].min.quaternion,
      this.buttonRanges[button].max.quaternion,
      analogValue
    );

    buttonObjects[button].position.lerpVectors(
      this.buttonRanges[button].min.position,
      this.buttonRanges[button].max.position,
      analogValue
    );
  },

  onModelLoaded: function (evt) {
    if (evt.target !== this.el || !this.data.model) { return; }
    if (this.isTouchV3orPROorPlus) {
      this.onTouchV3orPROorPlusModelLoaded(evt);
    } else {
      // All oculus headset controller models prior to the Quest 2 (i.e., Oculus Touch V3)
      // used a consistent format that is handled here
      var controllerObject3D = this.controllerObject3D = evt.detail.model;
      var buttonMeshes;

      buttonMeshes = this.buttonMeshes = {};

      buttonMeshes.grip = controllerObject3D.getObjectByName('buttonHand');
      this.originalXPositionGrip = buttonMeshes.grip && buttonMeshes.grip.position.x;
      buttonMeshes.trigger = controllerObject3D.getObjectByName('buttonTrigger');
      this.originalXRotationTrigger = buttonMeshes.trigger && buttonMeshes.trigger.rotation.x;
      buttonMeshes.thumbstick = controllerObject3D.getObjectByName('stick');
      buttonMeshes.xbutton = controllerObject3D.getObjectByName('buttonX');
      buttonMeshes.abutton = controllerObject3D.getObjectByName('buttonA');
      buttonMeshes.ybutton = controllerObject3D.getObjectByName('buttonY');
      buttonMeshes.bbutton = controllerObject3D.getObjectByName('buttonB');
    }

    for (var button in this.buttonMeshes) {
      if (this.buttonMeshes[button]) {
        cloneMeshMaterial(this.buttonMeshes[button]);
      }
    }

    this.applyOffset(evt.detail.model);

    this.el.emit('controllermodelready', {
      name: 'meta-touch-controls',
      model: this.data.model,
      rayOrigin: this.displayModel[this.data.hand].rayOrigin
    });
  },

  applyOffset: function (model) {
    model.position.copy(this.displayModel[this.data.hand].modelPivotOffset);
    model.rotation.copy(this.displayModel[this.data.hand].modelPivotRotation);
  },

  onTouchV3orPROorPlusModelLoaded: function (evt) {
    var controllerObject3D = this.controllerObject3D = evt.detail.model;

    var buttonObjects = this.buttonObjects = {};
    var buttonMeshes = this.buttonMeshes = {};
    var buttonRanges = this.buttonRanges = {};

    buttonMeshes.grip = controllerObject3D.getObjectByName('squeeze');
    buttonObjects.grip = controllerObject3D.getObjectByName('xr_standard_squeeze_pressed_value');
    buttonRanges.grip = {
      min: controllerObject3D.getObjectByName('xr_standard_squeeze_pressed_min'),
      max: controllerObject3D.getObjectByName('xr_standard_squeeze_pressed_max')
    };
    buttonObjects.grip.minX = buttonObjects.grip.position.x;

    buttonMeshes.thumbstick = controllerObject3D.getObjectByName('thumbstick');
    buttonObjects.thumbstick = controllerObject3D.getObjectByName('xr_standard_thumbstick_pressed_value');
    buttonRanges.thumbstick = {
      min: controllerObject3D.getObjectByName('xr_standard_thumbstick_pressed_min'),
      max: controllerObject3D.getObjectByName('xr_standard_thumbstick_pressed_max')
    };

    buttonObjects.thumbstickXAxis = controllerObject3D.getObjectByName('xr_standard_thumbstick_xaxis_pressed_value');
    buttonRanges.thumbstickXAxis = {
      min: controllerObject3D.getObjectByName('xr_standard_thumbstick_xaxis_pressed_min'),
      max: controllerObject3D.getObjectByName('xr_standard_thumbstick_xaxis_pressed_max')
    };

    buttonObjects.thumbstickYAxis = controllerObject3D.getObjectByName('xr_standard_thumbstick_yaxis_pressed_value');
    buttonRanges.thumbstickYAxis = {
      min: controllerObject3D.getObjectByName('xr_standard_thumbstick_yaxis_pressed_min'),
      max: controllerObject3D.getObjectByName('xr_standard_thumbstick_yaxis_pressed_max')
    };

    buttonMeshes.trigger = controllerObject3D.getObjectByName('trigger');
    buttonObjects.trigger = controllerObject3D.getObjectByName('xr_standard_trigger_pressed_value');
    buttonRanges.trigger = {
      min: controllerObject3D.getObjectByName('xr_standard_trigger_pressed_min'),
      max: controllerObject3D.getObjectByName('xr_standard_trigger_pressed_max')
    };
    buttonRanges.trigger.diff = {
      x: Math.abs(buttonRanges.trigger.max.rotation.x) - Math.abs(buttonRanges.trigger.min.rotation.x),
      y: Math.abs(buttonRanges.trigger.max.rotation.y) - Math.abs(buttonRanges.trigger.min.rotation.y),
      z: Math.abs(buttonRanges.trigger.max.rotation.z) - Math.abs(buttonRanges.trigger.min.rotation.z)
    };

    var button1 = this.data.hand === 'left' ? 'x' : 'a';
    var button2 = this.data.hand === 'left' ? 'y' : 'b';
    var button1id = button1 + 'button';
    var button2id = button2 + 'button';

    buttonMeshes[button1id] = controllerObject3D.getObjectByName(button1 + '_button');
    buttonObjects[button1id] = controllerObject3D.getObjectByName(button1 + '_button_pressed_value');
    buttonRanges[button1id] = {
      min: controllerObject3D.getObjectByName(button1 + '_button_pressed_min'),
      max: controllerObject3D.getObjectByName(button1 + '_button_pressed_max')
    };

    buttonMeshes[button2id] = controllerObject3D.getObjectByName(button2 + '_button');
    buttonObjects[button2id] = controllerObject3D.getObjectByName(button2 + '_button_pressed_value');
    buttonRanges[button2id] = {
      min: controllerObject3D.getObjectByName(button2 + '_button_pressed_min'),
      max: controllerObject3D.getObjectByName(button2 + '_button_pressed_max')
    };
  },

  onAxisMoved: function (evt) {
    emitIfAxesChanged(this, this.mapping[this.data.hand].axes, evt);
  },

  onThumbstickMoved: function (evt) {
    if (!this.buttonMeshes || !this.buttonMeshes.thumbstick) { return; }
    if (this.isTouchV3orPROorPlus) {
      this.updateThumbstickTouchV3orPROorPlus(evt);
      return;
    }
    for (var axis in evt.detail) {
      this.buttonObjects.thumbstick.rotation[this.axisMap[axis]] =
        this.buttonRanges.thumbstick.originalRotation[this.axisMap[axis]] -
        (Math.PI / 8) *
        evt.detail[axis] *
        (axis === 'y' || this.data.hand === 'right' ? -1 : 1);
    }
  },
  axisMap: {
    y: 'x',
    x: 'z'
  },

  updateThumbstickTouchV3orPROorPlus: function (evt) {
    var normalizedXAxis = (evt.detail.x + 1.0) / 2.0;
    this.buttonObjects.thumbstickXAxis.quaternion.slerpQuaternions(
      this.buttonRanges.thumbstickXAxis.min.quaternion,
      this.buttonRanges.thumbstickXAxis.max.quaternion,
      normalizedXAxis
    );

    var normalizedYAxis = (evt.detail.y + 1.0) / 2.0;
    this.buttonObjects.thumbstickYAxis.quaternion.slerpQuaternions(
      this.buttonRanges.thumbstickYAxis.min.quaternion,
      this.buttonRanges.thumbstickYAxis.max.quaternion,
      normalizedYAxis
    );
  },

  updateModel: function (buttonName, evtName) {
    if (!this.data.model) { return; }
    this.updateButtonModel(buttonName, evtName);
  },

  updateButtonModel: function (buttonName, state) {
    // update the button mesh colors
    var buttonMeshes = this.buttonMeshes;
    var button;
    var color;

    if (!buttonMeshes) { return; }
    if (buttonMeshes[buttonName]) {
      color = (state === 'up' || state === 'touchend') ? buttonMeshes[buttonName].originalColor || this.data.buttonColor : state === 'touchstart' ? this.data.buttonTouchColor : this.data.buttonHighlightColor;
      button = buttonMeshes[buttonName];
      button.material.color.set(color);
    }
  }
};
registerComponent('oculus-touch-controls', componentConfig);
export var Component = registerComponent('meta-touch-controls', componentConfig);

/**
 * Some of the controller models share the same material for different parts (buttons, triggers...).
 * In order to change their color independently we have to create separate materials.
 */
function cloneMeshMaterial (object3d) {
  object3d.traverse(function (node) {
    var newMaterial;
    if (node.type !== 'Mesh') return;
    newMaterial = node.material.clone();
    object3d.originalColor = node.material.color;
    node.material.dispose();
    node.material = newMaterial;
  });
}
