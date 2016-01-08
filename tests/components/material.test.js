/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('index').THREE;

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

    test('registers material to scene', function () {
      var el = this.el;
      var material = el.object3D.material;
      assert.equal(el.sceneEl.materials[material.uuid], material);
    });

    test('updates material', function () {
      var el = this.el;
      el.setAttribute('material', 'color: #F0F; side: double');
      assert.shallowDeepEqual(el.object3D.material.color,
                             {r: 1, g: 0, b: 1});
      assert.shallowDeepEqual(el.object3D.material.side, THREE.DoubleSide);
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

    test('can unset fog', function () {
      var el = this.el;
      assert.ok(el.object3D.material.fog);
      el.setAttribute('material', 'fog: false');
      assert.notOk(el.object3D.material.fog);
    });

    test('re-registers material when toggling material to flat shading', function () {
      var el = this.el;
      var oldMaterial = el.object3D.material;
      var newMaterial;
      el.setAttribute('material', 'shader: flat');
      el.setAttribute('material', 'shader: standard');

      newMaterial = el.object3D.material;
      assert.notOk(el.sceneEl.materials[oldMaterial.uuid]);
      assert.equal(el.sceneEl.materials[newMaterial.uuid], newMaterial);
    });
  });

  suite('remove', function () {
    test('removes material', function () {
      var el = this.el;
      assert.ok(el.object3D.material);
      el.removeAttribute('material');
      assert.equal(el.object3D.material.type, 'MeshBasicMaterial');
    });
  });

  suite('side', function () {
    test('can be set with initial material', function (done) {
      var el = entityFactory();
      el.setAttribute('material', 'side: double');
      el.addEventListener('loaded', function () {
        assert.ok(el.object3D.material.side, THREE.DoubleSide);
        done();
      });
    });

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

  suite('transparent', function () {
    test('can set transparent', function () {
      var el = this.el;
      assert.notOk(el.object3D.material.transparent);
      el.setAttribute('material', 'opacity: 1; transparent: true');
      assert.equal(el.object3D.material.opacity, 1);
      assert.ok(el.object3D.material.transparent);
    });

    test('can be set to false', function () {
      var el = this.el;
      el.setAttribute('material', 'opacity: 1; transparent: false');
      assert.equal(el.object3D.material.opacity, 1);
      assert.notOk(el.object3D.material.transparent);
    });

    test('is inferred if opacity is less than 1', function () {
      var el = this.el;
      assert.notOk(el.object3D.material.transparent);
      el.setAttribute('material', 'opacity: 0.75');
      assert.equal(el.object3D.material.opacity, 0.75);
      assert.ok(el.object3D.material.transparent);
    });
  });
});
