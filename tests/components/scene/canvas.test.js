 /* global Event, assert, process, suite, test */

var FULLSCREEN_CLASS = 'fullscreen';
var GRABBING_CLASS = 'a-canvas-grabbing';

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

  suite('grabbing', function () {
    test('adds grabbing class to document body on mousedown', function (done) {
      var el = this.sceneEl;
      el.canvas.dispatchEvent(new Event('mousedown'));
      process.nextTick(function () {
        assert.ok(document.body.classList.contains(GRABBING_CLASS));
        document.body.classList.remove('a-canvas-grabbing');
        done();
      });
    });

    test('removes grabbing class from document body on document body mouseup', function (done) {
      document.body.classList.add('a-canvas-grabbing');
      document.body.dispatchEvent(new Event('mouseup'));
      process.nextTick(function () {
        assert.notOk(document.body.classList.contains(GRABBING_CLASS));
        done();
      });
    });
  });
});
