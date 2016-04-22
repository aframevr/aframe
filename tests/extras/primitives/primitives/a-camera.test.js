/* global assert, suite, test */
suite('a-camera', function () {
  test('is the active camera when applied', function (done) {
    var scene = document.createElement('a-scene');
    var camera = document.createElement('a-camera');
    scene.appendChild(camera);
    document.body.appendChild(scene);

    camera.addEventListener('loaded', function () {
      assert.ok(camera.getComputedAttribute('camera').active);
      done();
    });
  });
});
