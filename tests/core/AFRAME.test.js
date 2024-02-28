/* global AFRAME, assert, suite, test */

suite('AFRAME', function () {
  test('exposes component prototype', function () {
    assert.ok(AFRAME.AComponent);
  });

  test('exposes THREE.js as global and on AFRAME', function () {
    assert.ok(window.THREE);
    assert.ok(AFRAME.THREE);
    assert.strictEqual(AFRAME.THREE, window.THREE);
  });

  test('exposes emitReady function', function () {
    assert.ok(AFRAME.emitReady);
  });
});
