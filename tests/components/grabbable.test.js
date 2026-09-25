/* global assert, setup, suite, test */
import { entityFactory } from '../helpers.js';

suite('grabbable', function () {
  var el;

  setup(function (done) {
    el = entityFactory();
    el.setAttribute('grabbable', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    }, {once: true});
  });

  test('automatically adds obb-collider component to entity', function () {
    assert.ok(el.components['obb-collider']);
  });

  test('removes obb-collider component upon removal', function () {
    el.removeAttribute('grabbable');
    assert.notOk(el.components['obb-collider']);
  });
});
