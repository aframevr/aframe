/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('link', function () {
  var el;

  setup(function (done) {
    el = entityFactory();
    el.setAttribute('link', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('does not initialize visual aspect by default', function () {
    assert.notOk(el.components.link.textEl);
    assert.notOk(el.components.link.sphereEl);
    assert.notOk(el.components.link.semiSphereEl);
  });

  test('initializes visual aspect if set', function () {
    el.setAttribute('link', 'visualAspectEnabled', true);
    assert.ok(el.components.link.textEl);
    assert.ok(el.components.link.sphereEl);
    assert.ok(el.components.link.semiSphereEl);
  });
});
