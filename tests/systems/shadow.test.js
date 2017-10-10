/* global process, setup, suite, test, assert, THREE */
var entityFactory = require('../helpers').entityFactory;

suite('shadow system', function () {
  var renderer;
  var system;

  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      renderer = el.sceneEl.renderer = {shadowMap: {}};
      system = el.sceneEl.systems.shadow;
      done();
    });
  });

  suite('init', function () {
    test('disabled by default', function () {
      assert.notOk(renderer.shadowMap.enabled);
    });

    test('configures renderer properties', function (done) {
      var sceneEl = this.el.sceneEl;

      // Systems cannot yet be directly updated.
      system.data.type = 'basic';
      system.data.renderReverseSided = false;
      system.data.renderSingleSided = false;
      sceneEl.emit('render-target-loaded');

      process.nextTick(function () {
        assert.equal(renderer.shadowMap.type, THREE.BasicShadowMap);
        assert.notOk(renderer.shadowMap.renderReverseSided);
        assert.notOk(renderer.shadowMap.renderSingleSided);
        done();
      });
    });
  });

  suite('setShadowMapEnabled', function () {
    test('updates the renderer', function () {
      system.setShadowMapEnabled(true);
      assert.ok(renderer.shadowMap.enabled);
    });
  });
});
