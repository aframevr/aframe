/* global assert, process, setup, suite, test */
var elFactory = require('../helpers').elFactory;

suite('camera', function () {
  var el;

  setup(function (done) {
    elFactory().then(_el => {
      el = _el;
      el.setAttribute('camera', '');
      done();
    });
  });

  suite('init', function () {
    test('adds a camera', function () {
      assert.equal(el.object3D.children[0].type, 'PerspectiveCamera');
    });

    test('sets sceneEl.camera', function () {
      assert.equal(el.sceneEl.camera, el.components.camera.camera);
    });
  });

  suite('update', function () {
    test('updates camera object3D', function () {
      assert.notEqual(el.object3D.fov, 40);
      el.setAttribute('camera', 'fov: 65');
      assert.equal(el.object3D.children[0].fov, 65);
    });

    test('does not create a new camera object', function () {
      const cameraId = el.getObject3D('camera').uuid;
      el.setAttribute('camera', 'fov: 65');
      assert.equal(el.object3D.children[0].uuid, cameraId);
    });
  });
});
