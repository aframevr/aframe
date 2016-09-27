/* global assert, suite, test, setup */
var helpers = require('../../../helpers');

suite('a-cursor', function () {
  setup(function (done) {
    var el = helpers.entityFactory();
    var cursorEl = this.cursorEl = document.createElement('a-cursor');
    el.addEventListener('loaded', function () {
      el.sceneEl.appendChild(cursorEl);
    });
    cursorEl.addEventListener('loaded', function () {
      done();
    });
  });

  test('sets cursor', function () {
    assert.ok(this.cursorEl.hasAttribute('cursor'));
  });
});
