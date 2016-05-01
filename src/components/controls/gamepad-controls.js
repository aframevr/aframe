var registerControls = require('../../core/controls').registerControls;
var THREE = require('../../lib/three');
var GAMEPAD = require('../../constants').gamepad;

var JOYSTICK_EPS = 0.2;

/**
 * Gamepad-controls component.
 *
 * Supports movement with the left joystick or dpad, and rotation with the right joystick.
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */
module.exports.Component = registerControls('gamepad-controls', {
  schema: {
    enabled: { default: true },
    controller: { default: 1, oneOf: [1, 2, 3, 4] },
    sensitivity: { default: 0.05 }
  },

  isVelocityActive: function () {
    if (!this.data.enabled || !this.isConnected()) { return false; }

    var dpad = this.getDpad();
    var joystick0 = this.getJoystick(0);
    var inputX = dpad.x || joystick0.x;
    var inputY = dpad.y || joystick0.y;
    return Math.abs(inputX) > JOYSTICK_EPS || Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function () {
    var dpad = this.getDpad();
    var joystick0 = this.getJoystick(0);
    var inputX = dpad.x || joystick0.x;
    var inputY = dpad.y || joystick0.y;
    var dVelocity = new THREE.Vector3();
    if (Math.abs(inputX) > JOYSTICK_EPS) { dVelocity.x += inputX; }
    if (Math.abs(inputY) > JOYSTICK_EPS) { dVelocity.z += inputY; }
    return dVelocity;
  },

  isRotationActive: function () {
    if (!this.data.enabled || !this.isConnected()) { return false; }

    var joystick1 = this.getJoystick(1);
    return Math.abs(joystick1.x) > JOYSTICK_EPS || Math.abs(joystick1.y) > JOYSTICK_EPS;
  },

  getRotationDelta: function () {
    var data = this.data;
    var lookVector = this.getJoystick(1);
    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) { lookVector.x = 0; }
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) { lookVector.y = 0; }
    return lookVector.multiplyScalar(data.sensitivity);
  },

  /**
   * Returns the state of the given joystick (0|1) as a THREE.Vector2.
   * @param  {number} id The joystick (0|1) for which to find state.
   * @return {THREE.Vector2}
   */
  getJoystick: function (index) {
    var gamepad = this.getGamepad();
    switch (index) {
      case 0: return new THREE.Vector2(gamepad.axes[0], gamepad.axes[1]);
      case 1: return new THREE.Vector2(gamepad.axes[2], gamepad.axes[3]);
      default: throw new Error('Unexpected joystick index "%d".', index);
    }
  },

  /**
   * Returns the state of the dpad as a THREE.Vector2.
   * @return {THREE.Vector2}
   */
  getDpad: function () {
    var gamepad = this.getGamepad();
    // Return zero vector if no dpad is present.
    if (!gamepad.buttons[GAMEPAD.DPAD_RIGHT]) {
      return new THREE.Vector2();
    }
    return new THREE.Vector2(
      (gamepad.buttons[GAMEPAD.DPAD_RIGHT].pressed ? 1 : 0) +
        (gamepad.buttons[GAMEPAD.DPAD_LEFT].pressed ? -1 : 0),
      (gamepad.buttons[GAMEPAD.DPAD_UP].pressed ? -1 : 0) +
        (gamepad.buttons[GAMEPAD.DPAD_DOWN].pressed ? 1 : 0)
    );
  },

  getGamepad: function () {
    if (!navigator.getGamepads) { return null; }
    return navigator.getGamepads()[this.data.controller - 1];
  },

  /**
   * Returns true if the gamepad is currently connected.
   * @return {boolean}
   */
  isConnected: function () {
    var gamepad = this.getGamepad();
    return !!(gamepad && gamepad.connected);
  }
});
