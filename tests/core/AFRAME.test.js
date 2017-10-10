/* global AFRAME, assert, suite, test */

suite('AFRAME', function () {
  test('exposes component prototype', function () {
    assert.ok(AFRAME.AComponent);
  });
});
