/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

var SRC = '/base/tests/assets/box/Box.gltf';

suite('gltf-model', function () {
  setup(function (done) {
    var el;
    var asset = document.createElement('a-asset-item');
    asset.setAttribute('id', 'gltf');
    asset.setAttribute('src', SRC);
    el = this.el = entityFactory({assets: [asset]});
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () { done(); });
  });

  test('can load', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      done();
    });
    el.setAttribute('gltf-model', '#gltf');
  });

  test('can load with url()', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      done();
    });
    el.setAttribute('gltf-model', `url(${SRC})`);
  });

  test('can load multiple models', function (done) {
    var el = this.el;
    var el2 = document.createElement('a-entity');
    var elPromise = new Promise(function (resolve) {
      el.addEventListener('model-loaded', resolve);
    });
    var el2Promise = new Promise(function (resolve) {
      el2.addEventListener('model-loaded', resolve);
    });

    Promise.all([elPromise, el2Promise]).then(function () {
      assert.ok(el.getObject3D('mesh'));
      assert.ok(el2.getObject3D('mesh'));
      assert.notEqual(el.components['gltf-model'].model, el2.components['gltf-model'].model);
      done();
    });

    el2.addEventListener('loaded', function () {
      el.setAttribute('gltf-model', '#gltf');
      el2.setAttribute('gltf-model', '#gltf');
    });
    el.sceneEl.appendChild(el2);
  });
});
