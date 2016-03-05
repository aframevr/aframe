/* global assert, process, setup, suite, test */
var entityFactory = require('../../helpers').entityFactory;

var UI_CLASSES = ['.a-orientation-modal', '.a-enter-vr-button', '.a-enter-vr-modal'];

suite('vr-mode-ui', function () {
  'use strict';

  setup(function () {
    this.entityEl = entityFactory();
    var el = this.el = this.entityEl.parentNode;
    el.setAttribute('vr-mode-ui', '');
    el.stereoRenderer = { setFullScreen: function () {} };
    el.load();
  });

  test('appends UI', function () {
    var scene = this.el;
    UI_CLASSES.forEach(function (uiClass) {
      assert.equal(scene.querySelectorAll(uiClass).length, 1);
    });
  });

  test('can disable UI', function () {
    var scene = this.el;
    scene.setAttribute('vr-mode-ui', 'enabled', false);
    UI_CLASSES.forEach(function (uiClass) {
      assert.notOk(scene.querySelector(uiClass));
    });
  });

  test('hides on enter VR', function () {
    var scene = this.el;
    scene.enterVR();
    UI_CLASSES.forEach(function (uiClass) {
      assert.ok(scene.querySelector(uiClass).className.indexOf('a-hidden'));
    });
  });

  test('shows on exit VR', function (done) {
    var scene = this.el;

    scene.enterVR();
    scene.exitVR();

    process.nextTick(function () {
      assert.equal(scene.querySelector('.a-enter-vr-button').className.indexOf('a-hidden'),
                   -1);
      done();
    });
  });
});
