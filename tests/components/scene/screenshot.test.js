/* global THREE, assert, setup, suite, test */
suite('screenshot', function () {
  var component;
  var sceneEl;

  function checkRenderTarget (renderTarget, colorSpace) {
    const texture = renderTarget.texture;
    assert.equal(texture.colorSpace, colorSpace);
    assert.equal(texture.minFilter, THREE.LinearFilter);
    assert.equal(texture.magFilter, THREE.LinearFilter);
    assert.equal(texture.wrapS, THREE.ClampToEdgeWrapping);
    assert.equal(texture.wrapT, THREE.ClampToEdgeWrapping);
    assert.equal(texture.format, THREE.RGBAFormat);
    assert.equal(texture.type, THREE.UnsignedByteType);
  }

  setup(function (done) {
    sceneEl = document.createElement('a-scene');
    done();
    // rest of scene setup has to be done inside the scripts to allow for
    // variation of colorManagement parameter, which can only be set on screen creation.
  });

  test('capture is called when key shortcut is pressed', function () {
    sceneEl.addEventListener('loaded', () => {
      component = sceneEl.components.screenshot;
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
    document.body.appendChild(sceneEl);
  });

  test('capture renders screenshot correctly (w/o Color Management)', function () {
    sceneEl.setAttribute('renderer', 'colorManagement: false');
    sceneEl.addEventListener('loaded', () => {
      component = sceneEl.components.screenshot;
      const renderTarget = component.getRenderTarget();
      checkRenderTarget(renderTarget, THREE.LinearSRGBColorSpace);
    });
    document.body.appendChild(sceneEl);
  });

  test('capture renders screenshot correctly (w/ Color Management)', function () {
    sceneEl.addEventListener('loaded', () => {
      component = sceneEl.components.screenshot;
      const renderTarget = component.getRenderTarget();
      checkRenderTarget(renderTarget, THREE.SRGBColorSpace);
    });
    document.body.appendChild(sceneEl);
  });
});
