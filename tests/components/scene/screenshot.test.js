/* global assert, setup, suite, test */
suite('screenshot', function () {
  let component;
  let sceneEl;

  setup(function (done) {
    sceneEl = document.createElement('a-scene');
    sceneEl.addEventListener('loaded', () => {
      component = sceneEl.components.screenshot;
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('capture is called when key shortcut is pressed', function () {
    let captureStub = this.sinon.stub(component, 'capture');
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
