 /* global Event, assert, process, setup, suite, test */
var CANVAS_GRAB_CLASS = 'a-grab-cursor';
var GRABBING_CLASS = 'a-grabbing';

suite('look-controls', function () {
  setup(function (done) {
    var el = this.sceneEl = document.createElement('a-scene');
    document.body.appendChild(el);
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('grabbing', function () {
    test('enables grab cursor on canvas', function () {
      this.sceneEl.canvas.classList.contains(CANVAS_GRAB_CLASS);
    });

    test('adds grabbing class to body on mousedown', function (done) {
      var el = this.sceneEl;
      process.nextTick(function () {
        assert.ok(document.body.classList.contains(GRABBING_CLASS));
        document.body.classList.remove(GRABBING_CLASS);
        done();
      });
      el.canvas.dispatchEvent(new Event('mousedown'));
    });

    test('removes grabbing class from body on body mouseup', function (done) {
      document.body.classList.add(GRABBING_CLASS);
      process.nextTick(function () {
        assert.notOk(document.body.classList.contains(GRABBING_CLASS));
        done();
      });
      window.dispatchEvent(new Event('mouseup'));
    });
  });
});
