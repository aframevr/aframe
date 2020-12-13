/* global assert, process, setup, suite, test */
let entityFactory = require('../helpers').entityFactory;
let THREE = require('index').THREE;

let SRC = '/base/tests/assets/box/Box.gltf';
let SRC_NO_DEFAULT_SCENE = '/base/tests/assets/box/Box_no_default_scene.gltf';

suite('gltf-model', function () {
  setup(function (done) {
    let el;
    let asset = document.createElement('a-asset-item');
    asset.setAttribute('id', 'gltf');
    asset.setAttribute('src', SRC);
    el = this.el = entityFactory({assets: [asset]});
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () { done(); });
  });

  test('can load', function (done) {
    let el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      done();
    });
    el.setAttribute('gltf-model', '#gltf');
  });

  test('can load with url()', function (done) {
    let el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      done();
    });
    el.setAttribute('gltf-model', `url(${SRC})`);
  });

  test('can load multiple models', function (done) {
    let el = this.el;
    let el2 = document.createElement('a-entity');
    let elPromise = new Promise(function (resolve) {
      el.addEventListener('model-loaded', resolve);
    });
    let el2Promise = new Promise(function (resolve) {
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

  test('attaches animation clips to model', function (done) {
    let el = this.el;
    let sceneMock = new THREE.Object3D();
    let animations = [
      new THREE.AnimationClip('run', 1.0, []),
      new THREE.AnimationClip('jump', 1.0, [])
    ];
    let gltfMock = {
      scene: sceneMock,
      scenes: [sceneMock],
      animations: animations
    };

    this.sinon.stub(THREE, 'GLTFLoader', function MockGLTFLoader () {
      this.load = function (url, onLoad) {
        process.nextTick(onLoad.bind(null, gltfMock));
      };
      this.setDRACOLoader = function () {};
    });

    el.addEventListener('model-loaded', function () {
      let model = el.components['gltf-model'].model;
      assert.ok(model);
      assert.equal(model.animations, animations);
      done();
    });

    el.setAttribute('gltf-model', '#gltf');
  });

  test('can load data not including default scene', function (done) {
    let el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      done();
    });
    el.setAttribute('gltf-model', `url(${SRC_NO_DEFAULT_SCENE})`);
  });
});
