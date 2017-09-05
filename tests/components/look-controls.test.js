 /* global Event, assert, process, setup, suite, test */

var CANVAS_GRAB_CLASS = 'a-grab-cursor';
var GRABBING_CLASS = 'a-grabbing';
var DEFAULT_USER_HEIGHT = 1.6;

suite('look-controls', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('exit-vr', function () {
    test('reset previous HMD position upon exit-vr event', function (done) {
      var el = this.sceneEl;
      var lookControls = el.camera.el.components['look-controls'];
      el.camera.el.components['camera'].hasPositionalTracking = false;
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
  });

  suite('head-height', function () {
    test('Return head height from camera device', function (done) {
      var el = this.sceneEl;
      var cameraEl = el.camera.el;
      var cameraHeight = 2.5;
      var lookControls = el.camera.el.components['look-controls'];
      cameraEl.setAttribute('camera', 'userHeight', cameraHeight);

      assert.shallowDeepEqual(lookControls.getUserHeight(), cameraHeight);
      done();
    });

    test('Return default head height for poses where device does not provide an offset', function (done) {
      var el = this.sceneEl;
      var lookControls = el.camera.el.components['look-controls'];
      var cameraEl = el.camera.el;
      cameraEl.components.camera = null;

      assert.shallowDeepEqual(lookControls.getUserHeight(), DEFAULT_USER_HEIGHT);
      done();
    });
  });
});
