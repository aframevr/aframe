 /* global assert, process, suite, test */

suite('canvas', function () {
  test('adds canvas to a-scene element', function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('loaded', function () {
      el.setAttribute('canvas', '');
      assert.ok(el.querySelector('canvas'));
      done();
    });
  });
});
