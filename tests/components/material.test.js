/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers.js').entityFactory;

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
      el.setAttribute('material', 'receiveLight: false');
      process.nextTick(function () {
        assert.equal(el.object3D.material.type, 'MeshBasicMaterial');

        el.setAttribute('material', 'receiveLight: true');
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
});
