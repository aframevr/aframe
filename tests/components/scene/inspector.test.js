/* global assert, setup, suite, teardown, test */

suite('inspector', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);

    el.addEventListener('loaded', function () { done(); });
  });

  teardown(function () {
    var el = this.sceneEl;
    el.parentNode.removeChild(el);
  });

  test('adds inspector SCRIPT element to page', function () {
    var el = this.sceneEl;

    // Have to call method directly because Chrome doesn't provide
    // a reliable method for KeyboardEvent
    el.components.inspector.onKeydown({
      keyCode: 73,
      ctrlKey: true,
      altKey: true
    });

    assert.equal(document.querySelectorAll('script[data-name=aframe-inspector]').length, 1);
  });
});
