 /* global assert, process, suite, test */
'use strict';

suite('canvas', function () {
  test('adds canvas to a-scene element', function (done) {
    var el = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('loaded', function () {
      el.setAttribute('canvas', '');
      assert.ok(el.querySelector('canvas'));
      done();
    });
  });
});
