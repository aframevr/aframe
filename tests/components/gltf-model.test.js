/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var THREE = require('index').THREE;

var SRC = '/base/tests/assets/box/Box.gltf';
var SRC_NO_DEFAULT_SCENE = '/base/tests/assets/box/Box_no_default_scene.gltf';

suite('gltf-model', function () {
  setup(function (done) {
    var el;
    var asset = document.createElement('a-asset-item');
    asset.setAttribute('id', 'gltf');
    asset.setAttribute('src', SRC);
    el = this.el = entityFactory({assets: [asset]});
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
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

  test('attaches animation clips to model', function (done) {
    var el = this.el;
    var sceneMock = new THREE.Object3D();
    var animations = [
      new THREE.AnimationClip('run', 1.0, []),
      new THREE.AnimationClip('jump', 1.0, [])
    ];
    var gltfMock = {
      scene: sceneMock,
      scenes: [sceneMock],
      animations: animations
    };

    this.sinon.replace(THREE, 'GLTFLoader', function MockGLTFLoader () {
      this.load = function (url, onLoad) {
        process.nextTick(onLoad.bind(null, gltfMock));
      };
      this.setDRACOLoader = function () {};
    });

    el.addEventListener('model-loaded', function () {
      var model = el.components['gltf-model'].model;
      assert.ok(model);
      assert.equal(model.animations, animations);
      done();
    });

    el.setAttribute('gltf-model', '#gltf');
  });

  test('can load data not including default scene', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      done();
    });
    el.setAttribute('gltf-model', `url(${SRC_NO_DEFAULT_SCENE})`);
  });
});
