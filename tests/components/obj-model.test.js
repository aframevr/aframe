/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

var MTL = '/base/tests/assets/crate/crate.mtl';
var OBJ = '/base/tests/assets/crate/crate.obj';

suite('obj-model', function () {
  setup(function (done) {
    var el;
    var objAsset = document.createElement('a-asset-item');
    var mtlAsset = document.createElement('a-asset-item');
    mtlAsset.setAttribute('id', 'mtl');
    mtlAsset.setAttribute('src', MTL);
    objAsset.setAttribute('id', 'obj');
    objAsset.setAttribute('src', OBJ);
    el = this.el = entityFactory({assets: [mtlAsset, objAsset]});
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () { done(); });
  });

  test('can load .OBJ only', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['obj-model'].model);
      done();
    });
    el.setAttribute('obj-model', 'obj', '#obj');
  });

  test('can load .OBJ + .MTL', function (done) {
    var el = this.el;
    var handled = false;  // Event listener is not getting torn down for some reason.
    el.addEventListener('model-loaded', function () {
      if (handled) { return; }
      handled = true;
      assert.ok(el.components['obj-model'].model);
      done();
    });
    el.setAttribute('obj-model', {mtl: '#mtl', obj: '#obj'});
  });

  test('can load .OBJ + .MTL with url()', function (done) {
    var el = this.el;
    var handled = false;  // Event listener is not getting torn down for some reason.
    el.addEventListener('model-loaded', function () {
      if (handled) { return; }
      handled = true;
      assert.ok(el.components['obj-model'].model);
      done();
    });
    el.setAttribute('obj-model', {mtl: `url(${MTL})`, obj: `url(${OBJ})`});
  });

  test('can load multiple .OBJ', function (done) {
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
      assert.notEqual(el.components['obj-model'].model, el2.components['obj-model'].model);
      done();
    });

    el2.addEventListener('loaded', function () {
      el.setAttribute('obj-model', {obj: '#obj'});
      el2.setAttribute('obj-model', {obj: '#obj'});
    });
    el.sceneEl.appendChild(el2);
  });

  test('can load .OBJ with material', function (done) {
    var parentEl = this.el;
    parentEl.addEventListener('child-attached', function (evt) {
      var el = evt.detail.el;
      el.addEventListener('model-loaded', function () {
        var material = el.getObject3D('mesh').children[0].material;
        assert.equal(material.color.r, 1);
        assert.equal(material.metalness, 0.123);
        done();
      });
    });
    parentEl.innerHTML = '<a-entity ' +
      'obj-model="obj: #obj" material="color: red; metalness: 0.123"></a-entity>';
  });
});
