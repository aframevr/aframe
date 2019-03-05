/* global assert, suite, test */

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
      assert.strictEqual(rendererSystem.foveationLevel, 0);
      assert.strictEqual(rendererSystem.highRefreshRate, false);
      assert.strictEqual(rendererSystem.physicallyCorrectLights, false);
      assert.strictEqual(rendererSystem.sortObjects, false);

      // Verify properties that are transferred from the renderer system to the rendering engine.
      var renderingEngine = sceneEl.renderer;
      assert.notOk(renderingEngine.gammaOutput);
      assert.notOk(renderingEngine.gammaFactor);
      assert.notOk(renderingEngine.sortObjects);
      assert.strictEqual(renderingEngine.physicallyCorrectLights, false);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer colorManagement', function (done) {
    var sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'colorManagement: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.renderer.gammaOutput);
      assert.equal(sceneEl.renderer.gammaFactor, 2.2);
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
    sceneEl.setAttribute('renderer', 'foveationLevel: 2');
    sceneEl.addEventListener('loaded', function () {
      var rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.foveationLevel, 2);
      done();
    });
    document.body.appendChild(sceneEl);
  });
});
