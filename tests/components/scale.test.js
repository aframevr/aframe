/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('scale', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('scale', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('defaults to 1 1 1', function () {
    var el = this.el;
    assert.equal(el.object3D.scale.x, 1);
    assert.equal(el.object3D.scale.y, 1);
    assert.equal(el.object3D.scale.z, 1);
  });

  suite('schema', function () {
    test('can get scale', function () {
      assert.shallowDeepEqual(this.el.getAttribute('scale'), {
        x: 1, y: 1, z: 1
      });
    });

    test('can get defined scale', function () {
      var el = this.el;
      el.setAttribute('scale', '1 2 3');
      assert.shallowDeepEqual(el.getAttribute('scale'), {
        x: 1, y: 2, z: 3
      });
    });
  });

  suite('update', function () {
    test('can set scale', function () {
      var el = this.el;
      el.setAttribute('scale', '-1 0.5 3.0');
      assert.equal(el.object3D.scale.x, -1);
      assert.equal(el.object3D.scale.y, 0.5);
      assert.equal(el.object3D.scale.z, 3);
    });
  });
});
