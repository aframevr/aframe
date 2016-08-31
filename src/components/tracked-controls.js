var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

/**
 * Tracked controls component
 * Interface with the gamepad API to handled tracked controllers. Selects
 * the appropriate controller and applies pose to the entity. It also observes
 * buttons state and emits appropriate events.
 *
 * @property {number} controller - index of the controller in the array
 *                                 returned by the Gamepad API.
 * @property {string} id - Selects the controllers among those returned by the Gamepad API.
 */
module.exports.Component = registerComponent('tracked-controls', {
  schema: {
    controller: {default: 0},
    id: {default: 'OpenVR Gamepad'}
  },

  init: function () {
    this.buttonStates = {};
    this.axisState = [];
  },

  update: function () {
    var controllers = this.system.controllers;
    var data = this.data;
    controllers = controllers.filter(hasId);
    // handId: 0 - right, 1 - left
    this.controller = controllers[data.controller];
    function hasId (controller) { return controller.id === data.id; }
  },

  tick: function (time, delta) {
    var mesh = this.el.getObject3D('mesh');
    // Update mesh animations.
    if (mesh && mesh.update) { mesh.update(delta / 1000); }
    this.updatePose();
    this.updateButtons();
  },

  updatePose: (function () {
    var controllerEuler = new THREE.Euler();
    var controllerPosition = new THREE.Vector3();
    var controllerQuaternion = new THREE.Quaternion();
    var dolly = new THREE.Object3D();
    var standingMatrix = new THREE.Matrix4();
    controllerEuler.order = 'YXZ';
    return function () {
      var controller;
      var pose;
      var orientation;
      var position;
      var el = this.el;
      var vrDisplay = this.system.vrDisplay;
      this.update();
      controller = this.controller;
      if (!controller) { return; }
      pose = controller.pose;
      orientation = pose.orientation || [0, 0, 0, 1];
      position = pose.position || [0, 0, 0];
      controllerQuaternion.fromArray(orientation);
      dolly.quaternion.fromArray(orientation);
      dolly.position.fromArray(position);
      dolly.updateMatrix();
      if (vrDisplay && vrDisplay.stageParameters) {
        standingMatrix.fromArray(vrDisplay.stageParameters.sittingToStandingTransform);
        dolly.applyMatrix(standingMatrix);
      }
      controllerEuler.setFromRotationMatrix(dolly.matrix);
      controllerPosition.setFromMatrixPosition(dolly.matrix);
      el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(controllerEuler.x),
        y: THREE.Math.radToDeg(controllerEuler.y),
        z: THREE.Math.radToDeg(controllerEuler.z)
      });
      el.setAttribute('position', {
        x: controllerPosition.x,
        y: controllerPosition.y,
        z: controllerPosition.z
      });
    };
  })(),

  updateButtons: function () {
    var i;
    var buttonState;
    var controller = this.controller;
    if (!this.controller) { return; }
    for (i = 0; i < controller.buttons.length; ++i) {
      buttonState = controller.buttons[i];
      this.handleButton(i, buttonState);
    }
    this.handleAxes(controller.axes);
  },

  handleAxes: function (controllerAxes) {
    var previousAxis = this.axisState;
    var changed = false;
    var i;
    for (i = 0; i < controllerAxes.length; ++i) {
      if (previousAxis[i] !== controllerAxes[i]) {
        changed = true;
        break;
      }
    }
    if (!changed) { return; }
    previousAxis = controllerAxes.slice();
    this.el.emit('axismove', {axis: previousAxis});
  },

  handleButton: function (id, buttonState) {
    var changed = false;
    changed = changed || this.handlePress(id, buttonState);
    changed = changed || this.handleTouch(id, buttonState);
    changed = changed || this.handleValue(id, buttonState);
    if (!changed) { return; }
    this.el.emit('buttonchanged', {id: id, state: buttonState});
  },

  handlePress: function (id, buttonState) {
    var buttonStates = this.buttonStates;
    var evtName;
    var previousButtonState = buttonStates[id] = buttonStates[id] || {};
    if (buttonState.pressed === previousButtonState.pressed) { return; }
    if (buttonState.pressed) {
      evtName = 'down';
    } else {
      evtName = 'up';
    }
    this.el.emit('button' + evtName, {id: id});
    previousButtonState.pressed = buttonState.pressed;
  },

  handleTouch: function (id, buttonState) {
    var buttonStates = this.buttonStates;
    var evtName;
    var previousButtonState = buttonStates[id] = buttonStates[id] || {};
    if (buttonState.touched === previousButtonState.touched) {
      return false;
    }
    if (buttonState.touched) {
      evtName = 'start';
    } else {
      evtName = 'end';
    }
    previousButtonState.touched = buttonState.touched;
    this.el.emit('touch' + evtName, {id: id, state: previousButtonState});
    return true;
  },

  handleValue: function (id, buttonState) {
    var buttonStates = this.buttonStates;
    var previousButtonState = buttonStates[id] = buttonStates[id] || {};
    if (buttonState.value === previousButtonState.value) { return false; }
    previousButtonState.value = buttonState.value;
    return true;
  }
});
