/* global process, setup, suite, test, sinon, THREE */
var entityFactory = require('../helpers').entityFactory;

suite('glTF system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    this.sinon.spy(THREE.GLTFLoader.Shaders, 'update');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('tick', function () {
    test('does nothing when no models are present', function () {
      var sceneEl = this.el.sceneEl;
      var model = {cool: 'very'};

      sceneEl.systems['gltf-model'].tick(100, 10);
      sinon.assert.notCalled(THREE.GLTFLoader.Shaders.update);

      sceneEl.systems['gltf-model'].registerModel(model);
      sceneEl.systems['gltf-model'].unregisterModel(model);
      sceneEl.systems['gltf-model'].tick(110, 10);
      sinon.assert.notCalled(THREE.GLTFLoader.Shaders.update);
    });

    test('updates shaders', function () {
      var sceneEl = this.el.sceneEl;
      var model = {cool: 'very'};

      sceneEl.systems['gltf-model'].registerModel(model);
      sceneEl.systems['gltf-model'].tick(110, 10);
      sinon.assert.calledOnce(THREE.GLTFLoader.Shaders.update);
      sinon.assert.calledWith(THREE.GLTFLoader.Shaders.update, sceneEl.object3D, sceneEl.camera);
    });
  });
});
