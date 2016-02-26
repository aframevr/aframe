/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('camera', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    var sceneEl = document.querySelector('a-scene');
    // Mocks canvas
    sceneEl.canvas = document.createElement('div');
    el.setAttribute('cursor', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('init', function () {
    test('the raycaster component is initalized', function () {
      assert.isOk(this.el.components.raycaster);
    });
  });
});
