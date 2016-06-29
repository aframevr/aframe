/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('standard material', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('material', 'shader: standard');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('can unset fog', function () {
    var el = this.el;
    assert.ok(el.getObject3D('mesh').material.fog);
    el.setAttribute('material', 'fog', false);
    assert.notOk(el.getObject3D('mesh').material.fog);
  });
});
