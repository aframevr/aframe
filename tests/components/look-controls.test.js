 /* global Event, assert, process, setup, suite, test */

var CANVAS_GRAB_CLASS = 'a-grab-cursor';
var helpers = require('../helpers');

suite('look-controls', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('cameraready', function () {
      done();
    });
  });

  suite('exit-vr', function () {
    test('reset previous HMD position upon exit-vr event', function (done) {
      var el = this.sceneEl;
      var lookControls = el.camera.el.components['look-controls'];
      lookControls.hasPositionalTracking = false;
      lookControls.previousHMDPosition.set(1, 2, 3);
      process.nextTick(function () {
        assert.ok(lookControls.previousHMDPosition.length() === 0);
        done();
      });
      el.dispatchEvent(new Event('exit-vr'));
    });
  });

  helpers.getSkipCISuite('grabbing', function () {
    test('enables grab cursor on canvas', function () {
      this.sceneEl.canvas.classList.contains(CANVAS_GRAB_CLASS);
    });

    test('adds grabbing style to scene canvas on mousedown', function (done) {
      var canvasEl = this.sceneEl.canvas;
      process.nextTick(function () {
        assert.ok(canvasEl.style.cursor === 'grabbing');
        canvasEl.style.cursor = '';
        done();
      });
      var event = new Event('mousedown');
      event.button = 0;
      canvasEl.dispatchEvent(event);
    });

    test('removes grabbing style from scene el canvas on document body mouseup', function (done) {
      var canvasEl = this.sceneEl.canvas;
      canvasEl.style.cursor = 'grabbing';
      process.nextTick(function () {
        assert.notOk(canvasEl.style.cursor === 'grabbing');
        done();
      });
      window.dispatchEvent(new Event('mouseup'));
    });

    test('requests pointer lock on mousedown', function (done) {
      var cameraEl = this.sceneEl.camera.el;
      var canvasEl = this.sceneEl.canvas;

      var requestPointerLock = this.sinon.spy(canvasEl, 'requestPointerLock');
      cameraEl.setAttribute('look-controls', {pointerLockEnabled: true});

      process.nextTick(function () {
        assert.ok(requestPointerLock.called);
        canvasEl.style.cursor = '';
        done();
      });

      var event = new Event('mousedown');
      event.button = 0;
      canvasEl.dispatchEvent(event);
    });

    test('does not request pointer lock when option is disabled', function (done) {
      var sceneEl = this.sceneEl;
      var canvasEl = sceneEl.canvas;
      var cameraEl = sceneEl.camera.el;

      var requestPointerLock = this.sinon.spy(canvasEl, 'requestPointerLock');

      cameraEl.setAttribute('look-controls', {pointerLockEnabled: false});

      process.nextTick(function () {
        assert.notOk(requestPointerLock.called);
        canvasEl.style.cursor = '';
        done();
      });

      var event = new Event('mousedown');
      event.button = 0;
      canvasEl.dispatchEvent(event);
    });
  });

  suite('saveCameraPose', function () {
    test('saves camera pose when entering VR w/ positional tracking', function () {
      var sceneEl = this.sceneEl;
      var cameraEl = sceneEl.camera.el;
      var lookControlsComponent = cameraEl.components['look-controls'];
      lookControlsComponent.hasPositionalTracking = true;
      cameraEl.setAttribute('look-controls', {userHeight: 0});
      cameraEl.setAttribute('position', '3 3 3');
      sceneEl.emit('enter-vr');
      assert.shallowDeepEqual(lookControlsComponent.savedPose.position,
                              {x: 3.0, y: 3.0, z: 3.0});
    });
  });

  suite('restoreCameraPose (exit VR)', function () {
    test('restores camera pose with headset', function () {
      var sceneEl = this.sceneEl;
      var cameraEl = sceneEl.camera.el;
      cameraEl.components['look-controls'].hasPositionalTracking = true;
      cameraEl.setAttribute('position', {x: 6, y: 6, z: 6});
      sceneEl.emit('enter-vr');
      cameraEl.setAttribute('position', {x: 9, y: 9, z: 9});
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 9, y: 9, z: 9});
      sceneEl.emit('exit-vr');
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 6, y: 6, z: 6});
    });
  });
});
