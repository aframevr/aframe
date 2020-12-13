/* global assert, process, setup, suite, test */
let entityFactory = require('../helpers').entityFactory;
let degToRad = require('index').THREE.Math.degToRad;

suite('rotation', function () {
  setup(function (done) {
    let el = this.el = entityFactory();
    el.setAttribute('rotation', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('defaults to 0 0 0', function () {
    let el = this.el;
    assert.equal(el.object3D.rotation.x, degToRad(0));
    assert.equal(el.object3D.rotation.y, degToRad(0));
    assert.equal(el.object3D.rotation.z, degToRad(0));
  });

  suite('schema', function () {
    test('can get rotation', function () {
      assert.shallowDeepEqual(this.el.getAttribute('rotation'), {
        x: 0, y: 0, z: 0
      });
    });

    test('can get defined rotation', function () {
      let el = this.el;
      el.setAttribute('rotation', '360 -90 45');
      assert.shallowDeepEqual(el.getAttribute('rotation'), {
        x: 360, y: -90, z: 45
      });
    });
  });

  suite('update', function () {
    test('can set rotation', function () {
      let el = this.el;
      el.setAttribute('rotation', '-360 180 90.5');
      assert.equal(el.object3D.rotation.x, degToRad(-360));
      assert.equal(el.object3D.rotation.y, degToRad(180));
      assert.equal(el.object3D.rotation.z, degToRad(90.5));
    });
  });
});
