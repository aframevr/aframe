/* global assert, process, suite, test */
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
    test('is a valid cubemap usable as an envMap', function (done) {
      document.body.innerHTML = `
      <a-scene>
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
        </a-sphere>
      </a-scene>`;

      document.body.addEventListener('materialtextureloaded', function () {
        const sphere = document.querySelector('a-sphere');
        const material = sphere.components.material.material;
        assert.isDefined(material.envMap);
        done();
      });
    });
  });
});
