/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('obj-model', function () {
  'use strict';

  setup(function (done) {
    var el;
    var objAsset = document.createElement('a-asset-item');
    var mtlAsset = document.createElement('a-asset-item');

    mtlAsset.setAttribute('id', 'mtl');
    mtlAsset.setAttribute('src', '/base/tests/assets/crate/crate.mtl');
    objAsset.setAttribute('id', 'obj');
    objAsset.setAttribute('src', '/base/tests/assets/crate/crate.obj');

    el = this.el = entityFactory({
      assets: [ mtlAsset, objAsset ]
    });
    el.setAttribute('obj-model', 'obj: #obj');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('can load .OBJ only', function (done) {
    var el = this.el;
    el.setAttribute('obj-model', 'obj', '#obj');
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['obj-model'].model);
      done();
    });
  });

  test('can .OBJ + .MTL', function (done) {
    var el = this.el;
    el.setAttribute('obj-model', { mtl: '#mtl', obj: '#obj' });
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['obj-model'].model);
      done();
    });
  });
});
