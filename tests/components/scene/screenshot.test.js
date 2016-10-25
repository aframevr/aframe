/* global assert, setup, suite, test, sinon */
suite('screenshot', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    this.sinon = sinon.sandbox.create();
    el.addEventListener('loaded', function () { done(); });
    document.body.appendChild(el);
  });

  test('capture is called when key shortcut is pressed', function () {
    var el = this.sceneEl;
    var captureStub = this.sinon.stub(el.components.screenshot, 'capture');
    // Must call onKeyDown method directly because Chrome doesn't provide a reliable method
    // for KeyboardEvent.
    el.components.screenshot.onKeyDown({
      keyCode: 83,
      altKey: true,
      ctrlKey: true
    });
    assert.ok(captureStub.called);
  });
});
