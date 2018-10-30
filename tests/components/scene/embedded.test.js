/* global assert, process, setup, suite, test */
var entityFactory = require('../../helpers').entityFactory;

var SCENE_FULLSCREEN_CLASS = 'a-fullscreen';

suite('embedded', function () {
  setup(function (done) {
    this.entityEl = entityFactory();
    var el = this.el = this.entityEl.parentNode;
    el.setAttribute('embedded', '');
    el.addEventListener('loaded', function () { done(); });
  });

  test('removes fullscreen class from scene element', function () {
    assert.notOk(document.documentElement.classList.contains(SCENE_FULLSCREEN_CLASS));
  });
});

suite('embedded (fullscreen)', function () {
  test('has fullscreen class without embedded', function (done) {
    var el = entityFactory();
    el.addEventListener('loaded', function () {
      assert.ok(document.documentElement.classList.contains(SCENE_FULLSCREEN_CLASS));
      done();
    });
  });
});
