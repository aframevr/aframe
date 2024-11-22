/* global  assert, setup, suite, test */

suite('background', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('loaded', function () { done(); });
  });

  test('change the background color', function () {
    var sceneEl = this.sceneEl;
    assert.shallowDeepEqual(sceneEl.object3D.background, null);
    sceneEl.setAttribute('background', {color: 'yellow'});
    assert.shallowDeepEqual(sceneEl.object3D.background, {r: 1, g: 1, b: 0});
  });

  test('remove the background', function () {
    var sceneEl = this.sceneEl;
    assert.shallowDeepEqual(sceneEl.object3D.background, null);
    sceneEl.setAttribute('background', {color: 'yellow'});
    sceneEl.removeAttribute('background');
    assert.equal(sceneEl.object3D.background, null);
  });
});
