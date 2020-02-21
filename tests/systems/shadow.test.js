/* global process, setup, suite, test, assert, THREE */
var entityFactory = require('../helpers').entityFactory;

suite('shadow system', function () {
  var renderer;
  var system;

  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      renderer = el.sceneEl.renderer = {
        shadowMap: {},
        xr: {isPresenting: false},
        setSize: function () {}
      };
      system = el.sceneEl.systems.shadow;
      done();
    });
  });

  suite('init', function () {
    test('disabled by default', function () {
      assert.notOk(renderer.shadowMap.enabled);
    });

    test('configures renderer properties', function (done) {
      var div;
      var scene;

      div = document.createElement('div');
      div.innerHTML = '<a-scene shadow="type: basic; autoUpdate: false">';
      scene = div.children[0];
      scene.addEventListener('loaded', function () {
        assert.equal(scene.renderer.shadowMap.type, THREE.BasicShadowMap);
        assert.notOk(scene.renderer.shadowMap.autoUpdate);
        done();
      });

      document.body.appendChild(div);
    });
  });

  suite('setShadowMapEnabled', function () {
    test('updates the renderer', function () {
      system.setShadowMapEnabled(true);
      assert.ok(renderer.shadowMap.enabled);
    });
  });
});
