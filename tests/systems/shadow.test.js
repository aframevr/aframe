/* global process, setup, suite, test, assert, THREE */
let entityFactory = require('../helpers').entityFactory;

suite('shadow system', function () {
  setup(function () {
    this.el = entityFactory();
  });

  suite('init', function () {
    test('enabled by default', function (done) {
      let el = this.el;
      this.el.addEventListener('loaded', function () {
        let sceneEl = el.sceneEl;
        let renderer = sceneEl.renderer;
        assert.ok(renderer.shadowMap.enabled);
        done();
      });
    });

    test('configures renderer properties', function (done) {
      let div;
      let scene;

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
    test('updates the renderer', function (done) {
      let el = this.el;
      el.addEventListener('loaded', function () {
        let renderer = el.sceneEl.renderer;
        let system = el.sceneEl.systems.shadow;
        system.setShadowMapEnabled(true);
        assert.ok(renderer.shadowMap.enabled);
        done();
      });
    });
  });
});
