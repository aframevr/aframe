/* global assert, process, setup, suite, test */
suite('a-camera', function () {
  setup(function (done) {
    var sceneEl = this.sceneEl = document.createElement('a-scene');
    var camera = this.camera = document.createElement('a-camera');
    sceneEl.appendChild(camera);
    document.body.appendChild(sceneEl);
    if (camera.hasLoaded) { done(); }
    camera.addEventListener('loaded', function () {
      done();
    });
  });

  suite('active camera', function () {
    test('is the active camera when applied', function (done) {
      var camera = this.camera;
      assert.ok(camera.getAttribute('camera').active);
      done();
    });
  });
});
