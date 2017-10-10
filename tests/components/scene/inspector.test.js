/* global AFRAME, assert, setup, suite, teardown, test */

suite('inspector', function () {
  var SCRIPT_SELECTOR = 'script[data-name=aframe-inspector]';

  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    // Set a fake URL so the inspector doesn't interfere with other tests.
    el.setAttribute('inspector', 'url: fake.js');
    document.body.appendChild(el);
    el.addEventListener('loaded', function () { done(); });
  });

  teardown(function () {
    var el = this.sceneEl;
    var script = document.querySelector(SCRIPT_SELECTOR);
    AFRAME.INSPECTOR = undefined;
    AFRAME.inspectorInjected = false;
    el.parentNode.removeChild(el);
    script.parentNode.removeChild(script);
  });

  test('injects inspector <script> via keyboard shortcut', function () {
    var el = this.sceneEl;
    // Must call onKeydown method directly because Chrome doesn't provide a reliable method
    // for KeyboardEvent.
    el.components.inspector.onKeydown({
      keyCode: 73,
      ctrlKey: true,
      altKey: true
    });
    assert.ok(document.querySelector(SCRIPT_SELECTOR));
  });

  test('injects inspector <script> via postMessage', function () {
    var el = this.sceneEl;
    el.components.inspector.onMessage({data: 'INJECT_AFRAME_INSPECTOR'});
    assert.ok(document.querySelector(SCRIPT_SELECTOR));
  });
});
