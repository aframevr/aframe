/* global assert, process, setup, suite, test */
'use strict';
var entityFactory = require('../../helpers').entityFactory;
var Gamepad = require('../../../src/constants').gamepad;

suite('gamepad-controls', function () {
  var gamepad, gamepads, gamepadControls;

  setup(function (done) {
    var el = this.el = entityFactory();

    gamepad = {connected: true, axes: [0, 0, 0, 0], buttons: {}};
    gamepad.buttons[Gamepad.DPAD_UP] = {pressed: false};
    gamepad.buttons[Gamepad.DPAD_LEFT] = {pressed: false};
    gamepad.buttons[Gamepad.DPAD_DOWN] = {pressed: false};
    gamepad.buttons[Gamepad.DPAD_RIGHT] = {pressed: false};
    gamepads = [gamepad];
    this.sinon.stub(navigator, 'getGamepads').returns(gamepads);

    el.setAttribute('gamepad-controls', '');
    el.addEventListener('loaded', function () {
      gamepadControls = el.components['gamepad-controls'];
      done();
    });
  });

  suite('isVelocityActive', function () {
    test('not active by default', function () {
      assert.isFalse(gamepadControls.isVelocityActive());
    });

    test('active when left joystick is pressed', function () {
      gamepad.axes[0] = 0.5;
      assert.isTrue(gamepadControls.isVelocityActive());
      gamepad.axes[0] = 0;
      assert.isFalse(gamepadControls.isVelocityActive());
    });

    test('active when dpad is pressed', function () {
      gamepad.buttons[Gamepad.DPAD_UP].pressed = true;
      assert.isTrue(gamepadControls.isVelocityActive());
      gamepad.buttons[Gamepad.DPAD_UP].pressed = false;
      assert.isFalse(gamepadControls.isVelocityActive());
    });

    test('inactive when disabled', function () {
      var el = this.el;
      el.setAttribute('gamepad-controls', {enabled: false});
      gamepad.buttons[Gamepad.DPAD_UP].pressed = true;
      gamepad.axes[0] = 0.5;
      assert.isFalse(gamepadControls.isVelocityActive());
    });

    test('inactive when disconnected', function () {
      gamepad.buttons[Gamepad.DPAD_UP].pressed = true;
      gamepad.connected = false;
      assert.isFalse(gamepadControls.isVelocityActive());
      gamepads.pop();
      assert.isFalse(gamepadControls.isVelocityActive());
    });
  });

  suite('isRotationActive', function () {
    test('not active by default', function () {
      assert.isFalse(gamepadControls.isRotationActive());
    });

    test('active when right joystick is pressed', function () {
      gamepad.axes[3] = 0.5;
      assert.isTrue(gamepadControls.isRotationActive());
      gamepad.axes[3] = 0;
      assert.isFalse(gamepadControls.isRotationActive());
    });

    test('inactive when disabled', function () {
      var el = this.el;
      el.setAttribute('gamepad-controls', {enabled: false});
      gamepad.axes[3] = 0.5;
      assert.isFalse(gamepadControls.isRotationActive());
    });

    test('inactive when disconnected', function () {
      gamepad.axes[3] = 0.5;
      gamepad.connected = false;
      assert.isFalse(gamepadControls.isRotationActive());
      gamepads.pop();
      assert.isFalse(gamepadControls.isRotationActive());
    });
  });

  suite('getVelocityDelta', function () {
    test('updates position with left joystick', function () {
      gamepad.axes[1] = -1;
      assert.shallowDeepEqual(gamepadControls.getVelocityDelta(), {x: 0, y: 0, z: -1});
      gamepad.axes[0] = -1;
      assert.shallowDeepEqual(gamepadControls.getVelocityDelta(), {x: -1, y: 0, z: -1});
      gamepad.axes[1] = 0;
      gamepad.axes[0] = 0;
      assert.shallowDeepEqual(gamepadControls.getVelocityDelta(), {x: 0, y: 0, z: 0});
    });

    test('updates position with dpad', function () {
      gamepad.buttons[Gamepad.DPAD_UP].pressed = true;
      assert.shallowDeepEqual(gamepadControls.getVelocityDelta(), {x: 0, y: 0, z: -1});
      gamepad.buttons[Gamepad.DPAD_LEFT].pressed = true;
      assert.shallowDeepEqual(gamepadControls.getVelocityDelta(), {x: -1, y: 0, z: -1});
      gamepad.buttons[Gamepad.DPAD_UP].pressed = false;
      gamepad.buttons[Gamepad.DPAD_LEFT].pressed = false;
      assert.shallowDeepEqual(gamepadControls.getVelocityDelta(), {x: 0, y: 0, z: 0});
    });
  });

  suite('getRotationDelta', function () {
    test('updates rotation with right joystick', function () {
      var el = this.el;
      el.setAttribute('gamepad-controls', 'sensitivity: 2');
      gamepad.axes[3] = 1;
      assert.shallowDeepEqual(gamepadControls.getRotationDelta(), {x: 0, y: 2});
      gamepad.axes[2] = -0.5;
      assert.shallowDeepEqual(gamepadControls.getRotationDelta(), {x: -1, y: 2});
      gamepad.axes[3] = 0;
      gamepad.axes[2] = 0;
      assert.shallowDeepEqual(gamepadControls.getRotationDelta(), {x: 0, y: 0});
    });
  });
});
