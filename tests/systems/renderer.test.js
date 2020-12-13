/* global assert, suite, test, THREE */

suite('renderer', function () {
  function createScene () {
    let sceneEl = this.sceneEl = document.createElement('a-scene');
    sceneEl.time = 0;
    return sceneEl;
  }

  test('default initialization', function (done) {
    let sceneEl = createScene();
    sceneEl.addEventListener('loaded', function () {
      // Verify the properties which are part of the renderer system schema.
      let rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.foveationLevel, 0);
      assert.strictEqual(rendererSystem.highRefreshRate, false);
      assert.strictEqual(rendererSystem.physicallyCorrectLights, false);
      assert.strictEqual(rendererSystem.sortObjects, false);

      // Verify properties that are transferred from the renderer system to the rendering engine.
      let renderingEngine = sceneEl.renderer;
      assert.notOk(renderingEngine.outputEncoding);
      assert.notOk(renderingEngine.sortObjects);
      assert.strictEqual(renderingEngine.physicallyCorrectLights, false);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer colorManagement', function (done) {
    let sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'colorManagement: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.renderer.outputEncoding);
      assert.equal(sceneEl.renderer.outputEncoding, THREE.sRGBEncoding);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer sortObjects', function (done) {
    let sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'sortObjects: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.renderer.sortObjects);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer physicallyCorrectLights', function (done) {
    let sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'physicallyCorrectLights: true;');
    sceneEl.addEventListener('loaded', function () {
      assert.ok(sceneEl.renderer.physicallyCorrectLights);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer highRefreshRate', function (done) {
    let sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'highRefreshRate: true');
    sceneEl.addEventListener('loaded', function () {
      let rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.highRefreshRate, true);
      done();
    });
    document.body.appendChild(sceneEl);
  });

  test('change renderer foveationLevel', function (done) {
    let sceneEl = createScene();
    sceneEl.setAttribute('renderer', 'foveationLevel: 2');
    sceneEl.addEventListener('loaded', function () {
      let rendererSystem = sceneEl.getAttribute('renderer');
      assert.strictEqual(rendererSystem.foveationLevel, 2);
      done();
    });
    document.body.appendChild(sceneEl);
  });
});
