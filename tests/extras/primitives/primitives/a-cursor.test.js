/* global assert, suite, test, setup */
import * as helpers from '../../../helpers.js';

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
