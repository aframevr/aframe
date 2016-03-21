/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('light system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('adds default lights to scene', function (done) {
    var el = this.el;
    var sceneEl = el.sceneEl;
    var i;
    var lights = sceneEl.querySelectorAll('[light]');

    // Remove lights to re-test.
    for (i = 0; i < lights.length; ++i) {
      sceneEl.removeChild(lights[i]);
    }
    assert.notOk(document.querySelectorAll('[light]').length);

    sceneEl.systems.light.setupDefaultLights();
    process.nextTick(function () {
      assert.ok(document.querySelectorAll('[light]').length);
      done();
    });
  });

  test('removes default lights when more lights are added', function (done) {
    var el = this.el;
    var lightEl = document.createElement('a-entity');
    lightEl.setAttribute('light', '');
    el.appendChild(lightEl);
    process.nextTick(function () {
      setTimeout(function () {
        assert.notOk(document.querySelectorAll('[data-aframe-default-light]').length);
        done();
      });
    });
  });
});
