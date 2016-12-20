/* global assert, process, setup, suite, test */
var entityFactory = require('../../helpers').entityFactory;

var ENTER_VR_CLASS = '.a-enter-vr.embedded';
var SCENE_FULL_SCREEN_CLASS = 'fullscreen';

suite('embedded', function () {
  setup(function (done) {
    this.entityEl = entityFactory();
    var el = this.el = this.entityEl.parentNode;
    var resolvePromise = function () { return Promise.resolve(); };
    el.setAttribute('embedded', '');
    el.effect = {
      requestPresent: resolvePromise,
      exitPresent: resolvePromise
    };
    el.addEventListener('loaded', function () { done(); });
  });

  test('adds embedded class to Enter VR element', function () {
    var scene = this.el;
    assert.equal(scene.querySelectorAll(ENTER_VR_CLASS).length, 1);
  });

  test('removes fullscreen class from scene element', function () {
    var scene = this.el;
    assert.notOk(scene.classList.contains(SCENE_FULL_SCREEN_CLASS));
  });

  test('can remove embedded class from Enter VR element', function () {
    var scene = this.el;
    scene.setAttribute('embedded', false);
    assert.notOk(scene.querySelector(ENTER_VR_CLASS));
  });

  test('can add fullscreen class to scene element', function () {
    var scene = this.el;
    scene.setAttribute('embedded', false);
    assert.ok(scene.classList.contains(SCENE_FULL_SCREEN_CLASS));
  });

  suite('with vr-mode-ui disabled', function () {
    test('removes fullscreen class from scene element', function () {
      var scene = this.el;
      scene.setAttribute('vr-mode-ui', 'enabled', false);
      scene.setAttribute('embedded', true);
      assert.notOk(scene.classList.contains(SCENE_FULL_SCREEN_CLASS));
    });

    test('can add fullscreen class to scene element', function () {
      var scene = this.el;
      scene.setAttribute('vr-mode-ui', 'enabled', false);
      scene.setAttribute('embedded', false);
      assert.ok(scene.classList.contains(SCENE_FULL_SCREEN_CLASS));
    });
  });
});
