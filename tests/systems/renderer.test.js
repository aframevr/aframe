/* global assert, suite, test, setup, teardown, THREE */

suite('renderer', function () {
  function createScene () {
    var sceneEl = this.sceneEl = document.createElement('a-scene');
    sceneEl.time = 0;
    return sceneEl;
  }

  test('default initialization', function (done) {
    var sceneEl = createScene();
    sceneEl.addEventListener('loaded', function () {
      // Verify the properties which are part of the renderer system schema.
      var rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.foveationLevel, 1);
      assert.strictEqual(rendererSystem.highRefreshRate, false);
      assert.strictEqual(rendererSystem.physicallyCorrectLights, false);
      assert.strictEqual(rendererSystem.sortObjects, false);
      assert.strictEqual(rendererSystem.colorManagement, true);

      // Verify properties that are transferred from the renderer system to the rendering engine.
      var renderingEngine = sceneEl.renderer;
      assert.strictEqual(renderingEngine.outputColorSpace, THREE.SRGBColorSpace);
      assert.notOk(renderingEngine.sortObjects);
      assert.strictEqual(renderingEngine.physicallyCorrectLights, false);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer colorManagement', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'colorManagement: false;');
    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.renderer.outputColorSpace);
      assert.equal(sceneEl.renderer.outputColorSpace, THREE.LinearSRGBColorSpace);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer sortObjects', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'sortObjects: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.renderer.sortObjects);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer physicallyCorrectLights', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'physicallyCorrectLights: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.renderer.physicallyCorrectLights);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer highRefreshRate', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'highRefreshRate: true');
    sceneEl.addEventListener('loaded', function () {
      var rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.highRefreshRate, true);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer foveationLevel', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'foveationLevel: 0.5');
    sceneEl.addEventListener('loaded', function () {
      var rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.foveationLevel, 0.5);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  suite('Set WebXR Frame Rates', function () {
    var xrTargetFrameRate;
    var xrSession;
    var oldConsoleWarn;
    var warnings = [];

    // Stub XR Session.
    setup(function () {
      xrTargetFrameRate = 0;
      xrSession = {
        supportedFrameRates: [60, 72],
        updateTargetFrameRate: function (rate) {
          xrTargetFrameRate = rate;
          return new Promise(function (resolve) {
            resolve();
          });
        }
      };
      // Stub warnings.
      oldConsoleWarn = console.warn;
      console.warn = function (message) {
        warnings.push(message);
      };
    });

    test('set WebXR frame rate when supported by browser (default, Quest 1)', function (done) {
      var sceneEl = createScene();
      sceneEl.setAttribute('renderer', '');
      sceneEl.addEventListener('loaded', function () {
        var rendererSystem = sceneEl.systems.renderer;
        xrTargetFrameRate = 0;
        rendererSystem.setWebXRFrameRate(xrSession);
        assert.strictEqual(xrTargetFrameRate, 60);
        done();
      });
      document.body.appendChild(sceneEl);
    });

    test('set WebXR frame rate when supported by browser (high, Quest 1)', function (done) {
      var sceneEl = createScene();
      sceneEl.setAttribute('renderer', 'highRefreshRate: true');
      sceneEl.addEventListener('loaded', function () {
        var rendererSystem = sceneEl.systems.renderer;
        xrTargetFrameRate = 0;
        rendererSystem.setWebXRFrameRate(xrSession);
        assert.strictEqual(xrTargetFrameRate, 72);
        done();
      });
      document.body.appendChild(sceneEl);
    });

    test('set WebXR frame rate when supported by browser (default, Quest 2 / Pro)', function (done) {
      xrSession.supportedFrameRates = [60, 72, 90, 120];
      var sceneEl = createScene();
      sceneEl.setAttribute('renderer', '');
      sceneEl.addEventListener('loaded', function () {
        var rendererSystem = sceneEl.systems.renderer;
        xrTargetFrameRate = 0;
        rendererSystem.setWebXRFrameRate(xrSession);
        assert.strictEqual(xrTargetFrameRate, 72);
        done();
      });
      document.body.appendChild(sceneEl);
    });

    test('set WebXR frame rate when supported by browser (high, Quest 2 / Pro)', function (done) {
      xrSession.supportedFrameRates = [60, 72, 90, 120];
      var sceneEl = createScene();
      sceneEl.setAttribute('renderer', 'highRefreshRate: true');
      sceneEl.addEventListener('loaded', function () {
        var rendererSystem = sceneEl.systems.renderer;
        xrTargetFrameRate = 0;
        rendererSystem.setWebXRFrameRate(xrSession);
        assert.strictEqual(xrTargetFrameRate, 90);
        done();
      });
      document.body.appendChild(sceneEl);
    });

    test('set WebXR frame rate fails', function (done) {
      xrSession.updateTargetFrameRate = function (rate) {
        return new Promise(function (resolve, reject) {
          reject();
        });
      };

      var sceneEl = createScene();
      sceneEl.setAttribute('renderer', 'highRefreshRate: true');
      sceneEl.addEventListener('loaded', function () {
        assert.strictEqual(warnings.length, 0);
        var rendererSystem = sceneEl.systems.renderer;
        xrTargetFrameRate = 0;
        rendererSystem.setWebXRFrameRate(xrSession);

        // warning generated asynchronously, so use zero-length
        // timeout to queue checking until after warning is generated.
        setTimeout(function () {
          assert.strictEqual(xrTargetFrameRate, 0);
          assert.strictEqual(warnings.length, 1);
          done();
        }, 0);
      });
      document.body.appendChild(sceneEl);
    });

    teardown(function () {
      console.warn = oldConsoleWarn;
    });
  });
});
