/* global assert, process, setup, suite, test */
let entityFactory = require('../helpers').entityFactory;

suite('flat material', function () {
  setup(function (done) {
    let el = this.el = entityFactory();
    el.setAttribute('geometry', '');
    el.setAttribute('material', 'shader: flat');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('can unset fog', function () {
    let el = this.el;
    assert.ok(el.getObject3D('mesh').material.fog);
    el.setAttribute('material', 'fog', false);
    assert.notOk(el.getObject3D('mesh').material.fog);
  });

  test('can use wireframes', function () {
    let el = this.el;
    assert.notOk(el.getObject3D('mesh').material.wireframe);
    el.setAttribute('material', 'wireframe', true);
    assert.ok(el.getObject3D('mesh').material.wireframe);
    assert.equal(el.getObject3D('mesh').material.wireframeLinewidth, 2);
  });
});
