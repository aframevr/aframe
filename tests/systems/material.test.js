/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('material system', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('registerMaterial', function () {
    test('registers material to scene', function () {
      var el = this.el;
      var material;
      var system;
      el.setAttribute('material', '');
      system = el.components.material.system;
      material = el.getObject3D('mesh').material;
      assert.equal(system.materials[material.uuid], material);
    });

    test('re-registers material when toggling material to flat shading', function () {
      var el = this.el;
      var oldMaterial;
      var newMaterial;
      var system;
      el.setAttribute('material', 'shader: flat');
      oldMaterial = el.getObject3D('mesh').material;
      el.setAttribute('material', 'shader: standard');
      system = el.components.material.system;
      newMaterial = el.getObject3D('mesh').material;
      assert.notOk(system.materials[oldMaterial.uuid]);
      assert.equal(system.materials[newMaterial.uuid], newMaterial);
    });
  });
});
