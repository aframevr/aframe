/* global assert, process, setup, suite, test */
'use strict';
var entityFactory = require('../../helpers').entityFactory;
var MouseEvent = window.MouseEvent;
var Event = window.Event;

suite('mouse-controls', function () {
  var mouseControls, canvasEl;

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('mouse-controls', '');

    this._setup = function () {
      mouseControls = el.components['mouse-controls'];
      canvasEl = el.sceneEl.canvas;
      canvasEl.requestPointerLock = canvasEl.requestPointerLock || function () {};
      this.sinon.stub(canvasEl, 'requestPointerLock');
      done();
    };

    el.addEventListener('loaded', function () {
      if (el.sceneEl.hasLoaded) {
        this._setup();
      } else {
        el.sceneEl.addEventListener('loaded', this._setup.bind(this));
      }
    }.bind(this));
  });

  suite('isRotationActive', function () {
    test('not active by default', function () {
      assert.isFalse(mouseControls.isRotationActive());
    });

    test('active when mouse is pressed', function () {
      canvasEl.dispatchEvent(new MouseEvent('mousedown'));
      assert.isTrue(mouseControls.isRotationActive());
      canvasEl.dispatchEvent(new MouseEvent('mouseup'));
      assert.isFalse(mouseControls.isRotationActive());
    });

    test('not active when disabled', function () {
      var el = this.el;
      el.setAttribute('mouse-controls', {enabled: false});
      canvasEl.dispatchEvent(new MouseEvent('mousedown'));
      assert.isFalse(mouseControls.isRotationActive());
    });

    test('active when pointer is locked', function () {
      mouseControls.pointerLocked = true;
      canvasEl.dispatchEvent(new MouseEvent('mousedown'));
      canvasEl.dispatchEvent(new MouseEvent('mouseup'));
      assert.isTrue(mouseControls.isRotationActive());
      mouseControls.pointerLocked = false;
      assert.isFalse(mouseControls.isRotationActive());
    });
  });

  suite('getRotationDelta', function () {
    test('updates rotation on mouse drag', function () {
      var el = this.el;
      el.setAttribute('mouse-controls', {sensitivity: 0.01});
      canvasEl.dispatchEvent(new MouseEvent('mousedown'));
      canvasEl.dispatchEvent(new MouseEvent('mousemove', {screenX: 100, screenY: 0}));
      assert.shallowDeepEqual(mouseControls.getRotationDelta(), {x: 1, y: 0});
      canvasEl.dispatchEvent(new MouseEvent('mousemove', {screenX: 150, screenY: 75}));
      canvasEl.dispatchEvent(new MouseEvent('mousemove', {screenX: 200, screenY: 75}));
      assert.shallowDeepEqual(mouseControls.getRotationDelta(), {x: 1, y: 0.75});
      assert.shallowDeepEqual(mouseControls.getRotationDelta(), {x: 0, y: 0});
    });

    test('updates rotation on pointerlock + mouse move', function () {
      var el = this.el;
      el.setAttribute('mouse-controls', {sensitivity: 0.01, pointerlockEnabled: true});
      mouseControls.pointerLocked = true;
      canvasEl.dispatchEvent(new MouseEvent('mousemove', {movementX: 100, movementY: 0}));
      assert.shallowDeepEqual(mouseControls.getRotationDelta(), {x: 1, y: 0});
      canvasEl.dispatchEvent(new MouseEvent('mousemove', {movementX: 100, movementY: 100}));
      assert.shallowDeepEqual(mouseControls.getRotationDelta(), {x: 1, y: 1});
      assert.shallowDeepEqual(mouseControls.getRotationDelta(), {x: 0, y: 0});
    });
  });

  suite('pointer lock', function () {
    test('enters pointer lock', function () {
      var el = this.el;
      el.setAttribute('mouse-controls', {pointerlockEnabled: true});
      canvasEl.dispatchEvent(new MouseEvent('mousedown'));
      assert(canvasEl.requestPointerLock.called);
      // Can't directly check that onPointerLockChange() works, because
      // document.pointerLockElement is readonly.
    });

    test('exits pointer lock', function () {
      var el = this.el;
      el.setAttribute('mouse-controls', {pointerlockEnabled: true});
      mouseControls.pointerLocked = true;
      document.dispatchEvent(new Event('pointerlockerror'));
      assert.isFalse(mouseControls.pointerLocked);
    });
  });
});
