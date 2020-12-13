/* global assert, suite, test, setup */
let helpers = require('../../../helpers');

suite('a-cursor', function () {
  setup(function (done) {
    let el = helpers.entityFactory();
    let cursorEl = this.cursorEl = document.createElement('a-cursor');
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
