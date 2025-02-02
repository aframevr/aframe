/* global assert, setup, suite, test */
suite('a-cubemap', function () {
  suite('valid cubemap', function () {
    // Due to limitations in karma / mocha, this test does not perfectly simulate
    // loading of a scene containing an a-cubemap.
    //
    // Specifically: in production the a-cubemap is created while the document.readyState is "loading"
    // and at this point the cubemap does not have children.
    // In karma / mocha tests, the document.readyState is already set to "complete" before
    // tests start to run, and we don't have any means of changing that, or simulating the
    // DOMContentLoaded event.
    //
    // This means we have no way to create a Unit Test that reproduces the problems
    // observed in issue #5230.
    setup(function (done) {
      var sceneEl = this.sceneEl = document.createElement('a-scene');
      document.body.appendChild(sceneEl);
      if (sceneEl.hasLoaded) { done(); }
      sceneEl.addEventListener('loaded', function () {
        done();
      });
    });

    test('a valid cubemap is usable as an envMap', function (done) {
      var sceneEl = this.sceneEl;
      sceneEl.innerHTML = `
        <a-assets>
          <a-cubemap id="reflection">
            <img src="base/tests/assets/test.png">
            <img src="base/tests/assets/test.png">
            <img src="base/tests/assets/test.png">
            <img src="base/tests/assets/test.png">
            <img src="base/tests/assets/test.png">
            <img src="base/tests/assets/test.png">
          </a-cubemap>
        </a-assets>
      
        <!-- Sphere with reflection. -->
        <a-sphere position="0 1 -2"
                  material="envMap:#reflection">
        </a-sphere>`;

      sceneEl.addEventListener('materialtextureloaded', function () {
        const sphere = document.querySelector('a-sphere');
        const material = sphere.components.material.material;
        assert.isDefined(material.envMap);
        done();
      });
    });

    test('cubemap images can be specified directly in envMap property', function (done) {
      var sceneEl = this.sceneEl;
      sceneEl.innerHTML = `
        <a-sphere position="0 1 -2"
                  material="envMap:url(base/tests/assets/test.png),
                                   url(base/tests/assets/test.png),
                                   url(base/tests/assets/test.png),
                                   url(base/tests/assets/test.png),
                                   url(base/tests/assets/test.png),
                                   url(base/tests/assets/test.png)">
        </a-sphere>`;

      sceneEl.addEventListener('materialtextureloaded', function () {
        const sphere = document.querySelector('a-sphere');
        const material = sphere.components.material.material;
        assert.isDefined(material.envMap);
        done();
      });
    });
  });
});
