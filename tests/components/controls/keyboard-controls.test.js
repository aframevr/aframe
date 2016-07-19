/* global assert, process, setup, suite, test */
'use strict';
var entityFactory = require('../../helpers').entityFactory;
var KeyboardEvent = window.KeyboardEvent;

suite('keyboard-controls', function () {
  var keyboardControls;

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('keyboard-controls', '');
    el.addEventListener('loaded', function () {
      keyboardControls = el.components['keyboard-controls'];
      done();
    });
  });

  suite('isVelocityActive', function () {
    test('not active by default', function () {
      assert.isFalse(keyboardControls.isVelocityActive());
    });

    test('active when target key is pressed', function () {
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyW'}));
      assert.isTrue(keyboardControls.isVelocityActive());
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyW'}));
      assert.isFalse(keyboardControls.isVelocityActive());
    });

    test('inactive when disabled', function () {
      var el = this.el;
      el.setAttribute('keyboard-controls', {enabled: false});
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyW'}));
      assert.isFalse(keyboardControls.isVelocityActive());
    });
  });

  suite('getVelocityDelta', function () {
    test('updates position with WASD keys', function () {
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyW'}));
      assert.shallowDeepEqual(keyboardControls.getVelocityDelta(), {x: 0, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyA'}));
      assert.shallowDeepEqual(keyboardControls.getVelocityDelta(), {x: -1, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyW'}));
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyA'}));
      assert.shallowDeepEqual(keyboardControls.getVelocityDelta(), {x: 0, y: 0, z: 0});
    });

    test('updates position with arrow keys', function () {
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'ArrowUp'}));
      assert.shallowDeepEqual(keyboardControls.getVelocityDelta(), {x: 0, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'ArrowLeft'}));
      assert.shallowDeepEqual(keyboardControls.getVelocityDelta(), {x: -1, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'ArrowUp'}));
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'ArrowLeft'}));
      assert.shallowDeepEqual(keyboardControls.getVelocityDelta(), {x: 0, y: 0, z: 0});
    });
  });
});
