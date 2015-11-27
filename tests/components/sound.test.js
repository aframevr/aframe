/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('sound', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('sound', 'src: base/examples/_sounds/click.ogg');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates sound', function () {
      this.el.components.sound.update();
      assert.ok(this.el.components.sound.sound);
    });
  });
});
