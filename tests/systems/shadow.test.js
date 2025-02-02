/* global setup, suite, test, assert, THREE */
import { entityFactory } from '../helpers.js';

suite('shadow system', function () {
  setup(function () {
    this.el = entityFactory();
  });

  suite('init', function () {
    test('shadowMap disabled by default', function (done) {
      var el = this.el;
      this.el.addEventListener('loaded', function () {
        var sceneEl = el.sceneEl;
        var renderer = sceneEl.renderer;
        assert.notOk(renderer.shadowMap.enabled);
        done();
      });
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

    test('shadowMap automatically enables', function (done) {
      var el = this.el;
      el.setAttribute('shadow', 'receive: false');
      el.addEventListener('loaded', function () {
        var renderer = el.sceneEl.renderer;
        assert.ok(renderer.shadowMap.enabled);
        done();
      });
    });
  });

  suite('enabled', function () {
    test('shadowMap remains disabled when system is explicitly disabled', function (done) {
      var el = this.el;
      el.setAttribute('shadow', 'receive: false');
      el.sceneEl.setAttribute('shadow', 'enabled: false');
      el.addEventListener('loaded', function () {
        var renderer = el.sceneEl.renderer;
        assert.notOk(renderer.shadowMap.enabled);
        done();
      });
    });

    test('shadowMap enables when system is (re)enabled', function (done) {
      var el = this.el;
      el.setAttribute('shadow', 'receive: false');
      el.sceneEl.setAttribute('shadow', 'enabled: false');
      el.addEventListener('loaded', function () {
        var renderer = el.sceneEl.renderer;
        assert.notOk(renderer.shadowMap.enabled);

        el.sceneEl.setAttribute('shadow', 'enabled: true');
        assert.ok(renderer.shadowMap.enabled);
        done();
      });
    });
  });

  suite('setShadowMapEnabled', function () {
    test('updates the renderer', function (done) {
      var el = this.el;
      el.addEventListener('loaded', function () {
        var renderer = el.sceneEl.renderer;
        var system = el.sceneEl.systems.shadow;
        system.setShadowMapEnabled(true);
        assert.ok(renderer.shadowMap.enabled);
        done();
      });
    });
  });
});
