/* global assert, setup, suite, test */

suite('reflection', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);
    const directionalLight = document.createElement('a-entity');
    directionalLight.setAttribute('light', {color: '#FFF', intensity: 0.6, castShadow: true});
    directionalLight.setAttribute('position', {x: -0.5, y: 1, z: 1});
    directionalLight.setAttribute('id', 'dirlight');
    el.appendChild(directionalLight);
    el.addEventListener('loaded', function () { done(); });
  });

  test('set environment on the scene', function () {
    var sceneEl = this.sceneEl;
    assert.isNull(sceneEl.object3D.environment);
    sceneEl.setAttribute('reflection', {directionalLight: '#dirlight'});
    assert.isNotNull(sceneEl.object3D.environment);
  });
});
