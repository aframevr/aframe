/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('position', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('position', '');
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('defaults to 0 0 0', function () {
    var el = this.el;
    assert.equal(el.object3D.position.x, 0);
    assert.equal(el.object3D.position.y, 0);
    assert.equal(el.object3D.position.z, 0);
  });

  suite('schema', function () {
    test('can get position', function () {
      assert.shallowDeepEqual(this.el.getAttribute('position'), {
        x: 0, y: 0, z: 0
      });
    });

    test('can get defined position', function () {
      var el = this.el;
      el.setAttribute('position', '1 2 3');
      assert.shallowDeepEqual(el.getAttribute('position'), {
        x: 1, y: 2, z: 3
      });
    });
  });

  suite('update', function () {
    test('can set position', function () {
      var el = this.el;
      el.setAttribute('position', '-1 0.5 3.0');
      assert.equal(el.object3D.position.x, -1);
      assert.equal(el.object3D.position.y, 0.5);
      assert.equal(el.object3D.position.z, 3);
    });

    test('can set position with object', function () {
      var el = this.el;
      el.setAttribute('position', {x: 1, y: 2, z: 3});
      assert.equal(el.object3D.position.x, 1);
      assert.equal(el.object3D.position.y, 2);
      assert.equal(el.object3D.position.z, 3);
    });

    test('can set position with incomplete object', function () {
      var el = this.el;
      el.setAttribute('position', {y: 2});
      assert.equal(el.object3D.position.x, 0);
      assert.equal(el.object3D.position.y, 2);
      assert.equal(el.object3D.position.z, 0);
    });
  });
});
