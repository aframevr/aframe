/* global assert, suite, test, setup, teardown, THREE */
var {
sortFrontToBack,
     sortRenderOrderOnly,
     sortBackToFront
} = require('systems/renderer');

suite('renderer', function () {
  function createScene () {
    var sceneEl = this.sceneEl = document.createElement('a-scene');
    sceneEl.time = 0;
    return sceneEl;
  }

  test('default initialization', function (done) {
    var sceneEl = createScene();
    var sortFunction;
    sceneEl.renderer.setOpaqueSort = function (s) { sortFunction = s; };
    sceneEl.addEventListener('loaded', function () {
      // Verify the properties which are part of the renderer system schema.
      var rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.foveationLevel, 1);
      assert.strictEqual(rendererSystem.highRefreshRate, false);
      assert.strictEqual(rendererSystem.physicallyCorrectLights, false);
      assert.strictEqual(rendererSystem.sortTransparentObjects, false);
      assert.strictEqual(rendererSystem.colorManagement, true);
      assert.strictEqual(rendererSystem.anisotropy, 1);

      // Verify properties that are transferred from the renderer system to the rendering engine.
      var renderingEngine = sceneEl.renderer;
      assert.strictEqual(renderingEngine.outputColorSpace, THREE.SRGBColorSpace);
      assert.ok(renderingEngine.sortObjects);
      assert.strictEqual(sortFunction, sortFrontToBack);
      assert.strictEqual(renderingEngine.useLegacyLights, true);
      assert.strictEqual(THREE.Texture.DEFAULT_ANISOTROPY, 1);

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

  test('change renderer sortTransparentObjects', function (done) {
    var sceneEl = createScene();

    var sortFunction;
    sceneEl.renderer.setTransparentSort = function (s) { sortFunction = s; };
    sceneEl.setAttribute('renderer', 'sortTransparentObjects: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.strictEqual(sortFunction, sortBackToFront);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('default renderer sortTransparentObjects', function (done) {
    var sceneEl = createScene();

    var sortFunction;
    sceneEl.renderer.setTransparentSort = function (s) { sortFunction = s; };
    sceneEl.addEventListener('loaded', function () {
      assert.strictEqual(sortFunction, sortRenderOrderOnly);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer physicallyCorrectLights', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'physicallyCorrectLights: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.notOk(sceneEl.renderer.useLegacyLights);
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

  test('change renderer anisotropy', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'anisotropy: 16');
    sceneEl.addEventListener('loaded', function () {
      var rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.anisotropy, 16);
      assert.strictEqual(THREE.Texture.DEFAULT_ANISOTROPY, 16);

      // verify that textures inherit it
      var texture = new THREE.Texture();
      assert.strictEqual(texture.anisotropy, 16);
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

  suite('sortFunctions', function () {
    var objects;
    var objectsRenderOrder;
    var objectsGroupOrder;

    setup(function () {
      objects = [
        { name: 'a', renderOrder: 0, z: 1 },
        { name: 'b', renderOrder: 0, z: 3 },
        { name: 'c', renderOrder: 0, z: 2 }
      ];

      objectsRenderOrder = [
        { name: 'a', renderOrder: 1, z: 1 },
        { name: 'b', renderOrder: 0, z: 3 },
        { name: 'c', renderOrder: -1, z: 2 }
      ];

      objectsGroupOrder = [
        { name: 'a', groupOrder: 0, renderOrder: 1, z: 1 },
        { name: 'b', groupOrder: 0, renderOrder: 0, z: 3 },
        { name: 'c', groupOrder: 1, renderOrder: -1, z: 2 }
      ];
    });

    function checkOrder (objects, array) {
      array.forEach((item, index) => {
        assert.equal(objects[index].name, item);
      });
    }

    test('Opaque sort sorts front-to-back', function () {
      objects.sort(sortFrontToBack);
      checkOrder(objects, ['a', 'c', 'b']);
    });

    test('Opaque sort respects renderOrder', function () {
      objectsRenderOrder.sort(sortFrontToBack);
      checkOrder(objectsRenderOrder, ['c', 'b', 'a']);
    });

    test('Opaque sort respects groupOrder, then renderOrder', function () {
      objectsGroupOrder.sort(sortFrontToBack);
      checkOrder(objectsGroupOrder, ['b', 'a', 'c']);
    });

    test('Transparent default sort sorts in DOM order', function () {
      objects.sort(sortRenderOrderOnly);
      checkOrder(objects, ['a', 'b', 'c']);
    });

    test('Transparent default sort respects renderOrder', function () {
      objectsRenderOrder.sort(sortRenderOrderOnly);
      checkOrder(objectsRenderOrder, ['c', 'b', 'a']);
    });

    test('Transparent default sort respects groupOrder, then renderOrder', function () {
      objectsGroupOrder.sort(sortRenderOrderOnly);
      checkOrder(objectsGroupOrder, ['b', 'a', 'c']);
    });

    test('Transparent spatial sort sorts back-to-front', function () {
      objects.sort(sortBackToFront);
      checkOrder(objects, ['b', 'c', 'a']);
    });

    test('Transparent spatial sort respects renderOrder', function () {
      objectsRenderOrder.sort(sortBackToFront);
      checkOrder(objectsRenderOrder, ['c', 'b', 'a']);
    });

    test('Transparent spatial sort respects groupOrder, then renderOrder', function () {
      objectsGroupOrder.sort(sortBackToFront);
      checkOrder(objectsGroupOrder, ['b', 'a', 'c']);
    });
  });
});
