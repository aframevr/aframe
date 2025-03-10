/* global assert, setup, suite, test */
import * as constants from 'constants/index.js';
import { entityFactory } from '../helpers.js';
var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';

suite('light system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      var i;
      var lights = el.sceneEl.querySelectorAll('[light]');
      // Remove lights to re-test.
      for (i = 0; i < lights.length; ++i) {
        el.sceneEl.removeChild(lights[i]);
      }
      done();
    });
  });

  test('adds default lights to scene', function () {
    var sceneEl = this.el.sceneEl;
    var i;
    var lights;
    var lightsNum = 0;

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
    var el = this.el;
    var lightEl = document.createElement('a-entity');
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
    var el = this.el;
    var sceneEl = el.sceneEl;

    // Systems cannot yet be updated via setAttribute().
    sceneEl.systems.light.data.defaultLightsEnabled = false;

    assert.notOk(document.querySelectorAll('[light]').length);

    el.sceneEl.systems.light.setupDefaultLights();
    setTimeout(function () {
      assert.notOk(document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']').length);
      done();
    });
  });

  test('removes default lights when more lights are added', function (done) {
    var el = this.el;
    var lightEl = document.createElement('a-entity');
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
