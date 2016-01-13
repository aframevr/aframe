 /* global assert, process, suite, test */
'use strict';

suite('cavnas', function () {
  test('adds canvas to a-scene element', function () {
    var el = document.createElement('a-scene');
    el.setAttribute('canvas', '');
    document.body.appendChild(el);
    assert.ok(el.querySelector('canvas'));
  });

  test('can take a selector to existing canvas', function (done) {
    var canvas = document.createElement('canvas');
    var el = document.createElement('a-scene');

    canvas.setAttribute('id', 'canvas');
    document.body.appendChild(canvas);

    el.setAttribute('canvas', 'canvas: #canvas');
    document.body.appendChild(el);

    el.addEventListener('loaded', function () {
      assert.equal(el.canvas, canvas);
      done();
    });
  });
});
