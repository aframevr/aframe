/* global AFRAME, assert, setup, suite, teardown, test */

suite('inspector', function () {
  let SCRIPT_SELECTOR = 'script[data-name=aframe-inspector]';

  setup(function (done) {
    let el = this.sceneEl = document.createElement('a-scene');
    // Set a fake URL so the inspector doesn't interfere with other tests.
    el.setAttribute('inspector', 'url: fake.js');
    document.body.appendChild(el);
    el.addEventListener('loaded', function () { done(); });
  });

  teardown(function () {
    let el = this.sceneEl;
    let script = document.querySelector(SCRIPT_SELECTOR);
    AFRAME.INSPECTOR = undefined;
    AFRAME.inspectorInjected = false;
    el.parentNode.removeChild(el);
    script.parentNode.removeChild(script);
  });

  test('injects inspector <script> via keyboard shortcut', function () {
    let el = this.sceneEl;
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
    let el = this.sceneEl;
    el.components.inspector.onMessage({data: 'INJECT_AFRAME_INSPECTOR'});
    assert.ok(document.querySelector(SCRIPT_SELECTOR));
  });
});
