/* global assert, process, setup, suite, test */
var constants = require('constants/');
var entityFactory = require('../helpers').entityFactory;

suite('light system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('adds default lights to scene', function () {
    var el = this.el;
    var sceneEl = el.sceneEl;
    var i;
    var lights = sceneEl.querySelectorAll('[light]');
    var lightsNum = 0;

    // Remove lights to re-test.
    for (i = 0; i < lights.length; ++i) {
      sceneEl.removeChild(lights[i]);
    }
    assert.notOk(document.querySelectorAll('[light]').length);

    sceneEl.systems.light.setupDefaultLights();
    lights = sceneEl.querySelectorAll('a-entity');

    // Remove lights to re-test.
    for (i = 0; i < lights.length; ++i) {
      if (!lights[i].components.light) { continue; }
      lightsNum += 1;
      assert.ok(lights[i].hasAttribute(constants.AFRAME_INJECTED));
    }
    assert.equal(lightsNum, 2);
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
