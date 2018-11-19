/* global assert, process, setup, suite, test */
const entityFactory = require('../helpers').entityFactory;

suite('tracked-controls', function () {
  var el;

  setup(function (done) {
    el = entityFactory();
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () { done(); });
    });
  });

  test('set tracked-controls-webxr if WebXR API available', function () {
    el.sceneEl.hasWebXR = true;
    el.pause();
    el.setAttribute('tracked-controls', '');
    assert.ok(el.components['tracked-controls-webxr']);
    assert.notOk(el.components['tracked-controls-webvr']);
  });

  test('set tracked-controls-webvr if WebVR API available', function () {
    el.sceneEl.hasWebXR = false;
    el.pause();
    el.setAttribute('tracked-controls', '');
    assert.ok(el.components['tracked-controls-webvr']);
    assert.notOk(el.components['tracked-controls-webxr']);
  });
});

