 /* global assert, process, suite, test */

var FULLSCREEN_CLASS = 'fullscreen';

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

  suite('fullscreen', function () {
    test('adds fullscreen class on enter VR', function () {
      var el = this.sceneEl;
      el.emit('enter-vr');
      assert.ok(el.canvas.classList.contains(FULLSCREEN_CLASS));
    });

    test('removes fullscreen class on exit VR', function () {
      var el = this.sceneEl;
      el.canvas.classList.add(FULLSCREEN_CLASS);
      el.emit('exit-vr');
      assert.notOk(el.canvas.classList.contains(FULLSCREEN_CLASS));
    });
  });
});
