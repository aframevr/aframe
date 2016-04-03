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

  test('can take a selector to existing canvas', function (done) {
    var canvas = document.createElement('canvas');
    var el = document.createElement('a-scene');

    canvas.setAttribute('id', 'canvas');
    document.body.appendChild(canvas);
    document.body.appendChild(el);
    el.setAttribute('canvas', 'canvas: #canvas');

    el.addEventListener('loaded', function () {
      assert.equal(el.canvas, canvas);
      done();
    });
  });
});
