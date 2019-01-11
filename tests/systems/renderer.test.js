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
      assert.notOk(sceneEl.renderer.gammaOutput);
      assert.notOk(sceneEl.renderer.gammaFactor);
      assert.notOk(sceneEl.renderer.sortObjects);
      assert.notOk(sceneEl.renderer.physicallyCorrectLights);
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
});
