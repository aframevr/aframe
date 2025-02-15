/* global assert, setup, suite, test */
import { entityFactory } from '../../helpers.js';

var UI_CLASSES = ['.a-orientation-modal', '.a-enter-vr'];

suite('xr-mode-ui', function () {
  setup(function (done) {
    this.entityEl = entityFactory();
    var el = this.el = this.entityEl.parentNode;
    el.hasWebXR = true;
    el.addEventListener('loaded', function () { done(); });
  });

  test('appends UI', function () {
    var scene = this.el;
    UI_CLASSES.forEach(function (uiClass) {
      assert.equal(scene.querySelectorAll(uiClass).length, 1);
    });
  });

  test('can disable UI', function () {
    var scene = this.el;
    scene.setAttribute('xr-mode-ui', 'enabled', false);
    UI_CLASSES.forEach(function (uiClass) {
      assert.notOk(scene.querySelector(uiClass));
    });
  });

  test('hides on enter VR', function (done) {
    var scene = this.el;
    // mock camera
    scene.camera = {
      el: {object3D: {}},
      updateProjectionMatrix: function () {}
    };

    scene.enterVR();

    setTimeout(function () {
      UI_CLASSES.forEach(function (uiClass) {
        assert.include(scene.querySelector(uiClass).className, 'a-hidden');
      });
      done();
    });
  });

  test('shows on exit VR', function (done) {
    var scene = this.el;
    // mock camera
    scene.camera = {
      el: {object3D: {}, getAttribute: function () { return {spectator: false}; }},
      updateProjectionMatrix: function () {}
    };

    scene.addEventListener('enter-vr', function () {
      scene.exitVR();
    });

    scene.addEventListener('exit-vr', function () {
      assert.notInclude(scene.querySelector('.a-enter-vr').className, 'a-hidden');
      done();
    });

    scene.enterVR();
  });
});
