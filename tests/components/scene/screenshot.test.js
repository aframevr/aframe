/* global assert, setup, suite, test */
suite('screenshot', function () {
  var component;
  var sceneEl;

  setup(function (done) {
    sceneEl = document.createElement('a-scene');
    sceneEl.addEventListener('loaded', () => {
      component = sceneEl.components.screenshot;
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('capture is called when key shortcut is pressed', function () {
    var captureStub = this.sinon.stub(component, 'capture');
    // Must call onKeyDown method directly because Chrome doesn't provide a reliable method
    // for KeyboardEvent.
    component.onKeyDown({
      keyCode: 83,
      altKey: true,
      ctrlKey: true
    });
    assert.ok(captureStub.called);
  });
});
