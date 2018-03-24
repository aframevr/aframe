/* global THREE, assert, setup, suite, test */

suite('renderer', function () {
  setup(function (done) {
    var sceneEl = this.sceneEl = document.createElement('a-scene');
    sceneEl.time = 0;
    document.body.appendChild(sceneEl);
    sceneEl.addEventListener('loaded', function () { done(); });
  });

  test('change renderer gammaOutput', function () {
    var sceneEl = this.sceneEl;
    assert.notOk(sceneEl.renderer.gammaOutput);
    sceneEl.setAttribute('renderer', {gammaOutput: true});
    assert.equal(sceneEl.renderer.gammaOutput, true);
  });

  test('change renderer sortObjects', function () {
    var sceneEl = this.sceneEl;
    assert.notOk(sceneEl.renderer.sortObjects);
    sceneEl.setAttribute('renderer', {sortObjects: true});
    assert.equal(sceneEl.renderer.sortObjects, true);
  });

  test('change renderer physicallyCorrectLights', function () {
    var sceneEl = this.sceneEl;
    assert.notOk(sceneEl.renderer.physicallyCorrectLights);
    sceneEl.setAttribute('renderer', {physicallyCorrectLights: true});
    assert.equal(sceneEl.renderer.physicallyCorrectLights, true);
  });

  test('recompile all materials when needed', function () {
    var sceneEl = this.sceneEl;
    var mesh = new THREE.Mesh();
    mesh.material.needsUpdate = false;
    sceneEl.object3D.add(mesh);

    sceneEl.setAttribute('renderer', '');
    assert.equal(mesh.material.needsUpdate, false);

    sceneEl.time = 100;

    sceneEl.setAttribute('renderer', {sortObjects: true});
    assert.equal(mesh.material.needsUpdate, false);
    sceneEl.setAttribute('renderer', {gammaOutput: true});
    assert.equal(mesh.material.needsUpdate, true);
  });
});
