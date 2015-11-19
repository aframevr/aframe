/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers.js').entityFactory;
var THREE = require('vr-markup').THREE;

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

    test('updates material', function (done) {
      var el = this.el;
      el.setAttribute('material', 'color: #F0F');
      process.nextTick(function () {
        assert.shallowDeepEqual(el.object3D.material.color,
                               {r: 1, g: 0, b: 1});
        done();
      });
    });

    test('defaults to standard material', function () {
      assert.equal(this.el.object3D.material.type, 'MeshStandardMaterial');
    });

    test('does not recreate material for basic updates', function (done) {
      var el = this.el;
      var uuid = el.object3D.material.uuid;
      el.setAttribute('material', 'color: #F0F');
      process.nextTick(function () {
        assert.equal(el.object3D.material.uuid, uuid);
        done();
      });
    });

    test('can toggle material to flat shading', function (done) {
      var el = this.el;
      el.setAttribute('material', 'shader: flat');
      process.nextTick(function () {
        assert.equal(el.object3D.material.type, 'MeshBasicMaterial');

        el.setAttribute('material', 'shader: standard');
        setTimeout(function () {
          assert.equal(el.object3D.material.type, 'MeshStandardMaterial');
          done();
        });
      });
    });
  });

  suite('remove', function () {
    test('removes material', function () {
      var el = this.el;
      assert.ok(el.object3D.material);
      el.removeAttribute('material');
      setTimeout(function () {
        assert.notOk(el.object3D.material);
      });
    });
  });

  suite('side', function (done) {
    test('defaults to front side', function () {
      assert.equal(this.el.object3D.material.side, THREE.FrontSide);
    });

    test('can be set to back', function () {
      var el = this.el;
      el.setAttribute('material', 'side: back');
      process.nextTick(function () {
        assert.equal(el.object3D.material.side, THREE.BackSide);
      });
    });

    test('can be set to double', function () {
      var el = this.el;
      el.setAttribute('material', 'side: double');
      process.nextTick(function () {
        assert.equal(el.object3D.material.side, THREE.DoubleSide);
      });
    });
  });
});
