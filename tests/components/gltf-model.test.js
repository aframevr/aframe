/* global assert, setup, suite, test */
import { entityFactory } from '../helpers.js';
import THREE from 'lib/three.js';

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

  test('can change model after first model has loaded', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.getObject3D('mesh'));

      el.addEventListener('model-loaded', function () {
        assert.ok(el.getObject3D('mesh'));
        done();
      }, {once: true});
      el.setAttribute('gltf-model', `url(${SRC_NO_DEFAULT_SCENE})`);

      // While loading, model is already removed from scenegraph
      assert.notOk(el.getObject3D('mesh'));
    }, {once: true});
    el.setAttribute('gltf-model', '#gltf');
  });

  test('can change model while first model is loading', function (done) {
    var el = this.el;
    var firstGlbMock = { scene: new THREE.Object3D() };
    var secondGlbMock = { scene: new THREE.Object3D() };

    el.addEventListener('componentinitialized', function (event) {
      if (event.detail.name !== 'gltf-model') {
        return;
      }

      // Mock loader to only complete loading the first model after the second model finished loading
      var resolveSecondModel;
      var promise = new Promise((resolve) => {
        resolveSecondModel = resolve;
      });
      var loader = el.components['gltf-model'].loader;
      loader.load = function (url, onLoad) {
        if (url === 'first.glb') {
          promise.then(() => {
            onLoad(firstGlbMock);
            allLoaded();
          });
        } else if (url === 'second.glb') {
          onLoad(secondGlbMock);
          resolveSecondModel();
        }
      };
    });

    // Wait for both models to be loaded
    function allLoaded () {
      assert.equal(el.components['gltf-model'].model, secondGlbMock.scene);
      done();
    }

    el.setAttribute('gltf-model', 'first.glb');
    el.setAttribute('gltf-model', 'second.glb');
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

    el.addEventListener('componentinitialized', function (event) {
      if (event.detail.name !== 'gltf-model') {
        return;
      }

      var loader = el.components['gltf-model'].loader;
      loader.load = function (url, onLoad) {
        setTimeout(onLoad.bind(null, gltfMock));
      };

      // Start loading model
      el.setAttribute('gltf-model', '#gltf');
    });

    el.addEventListener('model-loaded', function () {
      var model = el.components['gltf-model'].model;
      assert.ok(model);
      assert.equal(model.animations, animations);
      done();
    });

    el.setAttribute('gltf-model', '');
  });

  test('can load data not including default scene', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      done();
    });
    el.setAttribute('gltf-model', `url(${SRC_NO_DEFAULT_SCENE})`);
  });

  test('removes model when src is emptied', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      assert.equal(el.components['gltf-model'].model, el.getObject3D('mesh'));

      el.setAttribute('gltf-model', '');
      assert.notOk(el.components['gltf-model'].model);
      assert.notOk(el.getObject3D('mesh'));
      done();
    });
    el.setAttribute('gltf-model', '#gltf');
  });

  test('removes model when component is removed', function (done) {
    var el = this.el;
    el.addEventListener('model-loaded', function () {
      assert.ok(el.components['gltf-model'].model);
      assert.equal(el.components['gltf-model'].model, el.getObject3D('mesh'));

      el.removeAttribute('gltf-model');
      assert.notOk(el.getObject3D('mesh'));
      done();
    });
    el.setAttribute('gltf-model', '#gltf');
  });
});
