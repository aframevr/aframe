/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('aframe-core').THREE;

suite('material', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('material', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates material', function () {
      assert.ok(this.el.object3D.material);
    });

    test('updates material', function () {
      var el = this.el;
      el.setAttribute('material', 'color: #F0F');
      assert.shallowDeepEqual(el.object3D.material.color,
                             {r: 1, g: 0, b: 1});
    });

    test('defaults to standard material', function () {
      assert.equal(this.el.object3D.material.type, 'MeshStandardMaterial');
    });

    test('does not recreate material for basic updates', function () {
      var el = this.el;
      var uuid = el.object3D.material.uuid;
      el.setAttribute('material', 'color: #F0F');
      assert.equal(el.object3D.material.uuid, uuid);
    });

    test('can toggle material to flat shading', function () {
      var el = this.el;
      el.setAttribute('material', 'shader: flat');
      el.setAttribute('material', 'shader: standard');
      assert.equal(el.object3D.material.type, 'MeshStandardMaterial');
    });
  });

  suite('remove', function () {
    test('removes material', function () {
      var el = this.el;
      assert.ok(el.object3D.material);
      el.removeAttribute('material');
      assert.notOk(el.object3D.material);
    });
  });

  suite('side', function () {
    test('defaults to front side', function () {
      assert.equal(this.el.object3D.material.side, THREE.FrontSide);
    });

    test('can be set to back', function () {
      var el = this.el;
      el.setAttribute('material', 'side: back');
      assert.equal(el.object3D.material.side, THREE.BackSide);
    });

    test('can be set to double', function () {
      var el = this.el;
      el.setAttribute('material', 'side: double');
      assert.equal(el.object3D.material.side, THREE.DoubleSide);
    });
  });
});
