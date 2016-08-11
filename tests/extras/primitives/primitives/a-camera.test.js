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
      assert.ok(camera.getComputedAttribute('camera').active);
      done();
    });
  });

  suite('user-height', function () {
    test('updates height offset when DOM user-height attibute changes', function (done) {
      var camera = this.camera;
      assert.shallowDeepEqual(camera.getAttribute('position'), {x: 0, y: 1.6, z: 0});
      camera.setAttribute('user-height', '0.5');
      process.nextTick(function () {
        assert.shallowDeepEqual(camera.getAttribute('position'), {x: 0, y: 0.5, z: 0});
        done();
      });
    });
  });
});
