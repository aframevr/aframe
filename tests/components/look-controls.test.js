 /* global Event, assert, process, setup, suite, test */

var CANVAS_GRAB_CLASS = 'a-grab-cursor';
var GRABBING_CLASS = 'a-grabbing';

suite('look-controls', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('camera-ready', function () {
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

  suite('grabbing', function () {
    test('enables grab cursor on canvas', function () {
      this.sceneEl.canvas.classList.contains(CANVAS_GRAB_CLASS);
    });

    test('adds grabbing class to document body on mousedown', function (done) {
      var el = this.sceneEl;
      process.nextTick(function () {
        assert.ok(document.body.classList.contains(GRABBING_CLASS));
        document.body.classList.remove(GRABBING_CLASS);
        done();
      });
      var event = new Event('mousedown');
      event.button = 0;
      el.canvas.dispatchEvent(event);
    });

    test('removes grabbing class from document body on document body mouseup', function (done) {
      document.body.classList.add(GRABBING_CLASS);
      process.nextTick(function () {
        assert.notOk(document.body.classList.contains(GRABBING_CLASS));
        done();
      });
      window.dispatchEvent(new Event('mouseup'));
    });

    test('requests pointer lock on mousedown', function (done) {
      var canvasEl = this.sceneEl.canvas;

      var requestPointerLock = this.sinon.spy(canvasEl, 'requestPointerLock');

      process.nextTick(function () {
        assert.ok(requestPointerLock.called);
        document.body.classList.remove(GRABBING_CLASS);
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
        document.body.classList.remove(GRABBING_CLASS);
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

    test('does not save camera pose when entering VR w/o positional tracking', function () {
      var sceneEl = this.sceneEl;
      var cameraEl = sceneEl.camera.el;
      var lookControlsComponent = cameraEl.components['look-controls'];
      lookControlsComponent.hasPositionalTracking = false;
      sceneEl.emit('enter-vr');
      assert.notOk(lookControlsComponent.savedPose);
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

    test('does not restore camera pose without headset', function () {
      var sceneEl = this.sceneEl;
      var cameraEl = sceneEl.camera.el;
      cameraEl.components['look-controls'].hasPositionalTracking = false;
      sceneEl.emit('enter-vr');
      cameraEl.setAttribute('position', {x: 6, y: 6, z: 6});
      sceneEl.emit('exit-vr');
      assert.shallowDeepEqual(cameraEl.getAttribute('position'), {x: 6, y: 6, z: 6});
    });
  });
});
