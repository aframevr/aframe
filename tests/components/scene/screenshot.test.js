/* global AFRAME, THREE, assert, setup, suite, test */
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

  test('capture is called when key shortcut is pressed', function (done) {
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
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('capture renders screenshot correctly (w/o Color Management)', function (done) {
    sceneEl.setAttribute('renderer', 'colorManagement: false');
    sceneEl.addEventListener('loaded', () => {
      component = sceneEl.components.screenshot;
      const renderTarget = component.getRenderTarget();
      checkRenderTarget(renderTarget, THREE.LinearSRGBColorSpace);
      renderTarget.dispose();
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('capture renders screenshot correctly (w/ Color Management)', function (done) {
    sceneEl.addEventListener('loaded', () => {
      component = sceneEl.components.screenshot;
      const renderTarget = component.getRenderTarget();
      checkRenderTarget(renderTarget, THREE.SRGBColorSpace);
      renderTarget.dispose();
      done();
    });
    document.body.appendChild(sceneEl);
  });

  suite('flipPixelsVertically', function () {
    [
      {width: 3, height: 2},
      {width: 2, height: 3}
    ].forEach(function (size) {
      test('flips RGBA rows for ' + size.width + 'x' + size.height, function () {
        var pixels = new Uint8Array(size.width * size.height * 4);
        for (var i = 0; i < pixels.length; i++) { pixels[i] = i; }
        var original = pixels.slice();
        var flip = AFRAME.components.screenshot.Component.prototype.flipPixelsVertically;
        var flipped = flip(pixels, size.width, size.height);
        for (var y = 0; y < size.height; y++) {
          for (var x = 0; x < size.width; x++) {
            for (var channel = 0; channel < 4; channel++) {
              assert.equal(flipped[(y * size.width + x) * 4 + channel],
                           pixels[((size.height - y - 1) * size.width + x) * 4 + channel]);
            }
          }
        }
        assert.deepEqual(pixels, original, 'source pixels are unchanged');
        assert.notStrictEqual(flipped.buffer, pixels.buffer);
      });
    });
  });
});
