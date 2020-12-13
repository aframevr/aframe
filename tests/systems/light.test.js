/* global assert, process, setup, suite, test */
let constants = require('constants/');
let entityFactory = require('../helpers').entityFactory;
let DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';

suite('light system', function () {
  setup(function (done) {
    let el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      let i;
      let lights = el.sceneEl.querySelectorAll('[light]');
      // Remove lights to re-test.
      for (i = 0; i < lights.length; ++i) {
        el.sceneEl.removeChild(lights[i]);
      }
      done();
    });
  });

  test('adds default lights to scene', function () {
    let sceneEl = this.el.sceneEl;
    let i;
    let lights;
    let lightsNum = 0;

    assert.notOk(document.querySelectorAll('[light]').length);
    sceneEl.systems.light.setupDefaultLights();
    lights = sceneEl.querySelectorAll('[light]');

    for (i = 0; i < lights.length; ++i) {
      if (!lights[i].components.light) { continue; }
      lightsNum += 1;
      assert.ok(lights[i].hasAttribute(constants.AFRAME_INJECTED));
    }
    assert.equal(lightsNum, 2);
  });

  test('it does not add default lights to scene if there are used define lights', function (done) {
    let el = this.el;
    let lightEl = document.createElement('a-entity');
    lightEl.setAttribute('light', '');

    assert.notOk(document.querySelectorAll('[light]').length);

    lightEl.addEventListener('loaded', function () {
      el.sceneEl.systems.light.setupDefaultLights();
      assert.notOk(document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']').length);
      done();
    });
    el.appendChild(lightEl);
  });

  test('it does not add default lights to scene if they are disabled', function (done) {
    let el = this.el;
    let sceneEl = el.sceneEl;

    // Systems cannot yet be updated via setAttribute().
    sceneEl.systems.light.data.defaultLightsEnabled = false;

    assert.notOk(document.querySelectorAll('[light]').length);

    el.sceneEl.systems.light.setupDefaultLights();
    process.nextTick(function () {
      assert.notOk(document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']').length);
      done();
    });
  });

  test('removes default lights when more lights are added', function (done) {
    let el = this.el;
    let lightEl = document.createElement('a-entity');
    lightEl.setAttribute('light', '');

    assert.notOk(document.querySelectorAll('[light]').length);
    el.sceneEl.systems.light.setupDefaultLights();
    assert.ok(document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']').length);

    lightEl.addEventListener('loaded', function () {
      assert.notOk(document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']').length);
      done();
    });
    el.appendChild(lightEl);
  });
});
