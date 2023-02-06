/* global assert, process, suite, test */
suite('a-cubemap', function () {
  suite('valid cubemap', function () {
    // This test is problematic - it runs against A-Frame 1.4.1 successfully
    // even though a-cubemap doesn't run on A-Frame 1.4.1 in production.
    // In production, when validate() is invoked in a-cubemap, the children
    // have not yet been created, and cubemap validation fails.

    // I've not yet been able to reproduce that problem with a Unit Test,
    // presumably due to subtle differences in sequences when loading a page
    // vs adding to the body innerHTML.
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
