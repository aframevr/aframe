/* global sinon, setup, teardown */

/**
 * __init.test.js is run before every test case.
 */
window.debug = true;

navigator.getVRDisplays = function () {
  var resolvePromise = Promise.resolve();
  var mockVRDisplay = {
    cancelAnimationFrame: function (h) { return window.cancelAnimationFrame(1); },
    capabilities: {},
    exitPresent: resolvePromise,
    getPose: function () { return { orientation: null, position: null }; },
    requestAnimationFrame: function () { return 1; },
    requestPresent: resolvePromise,
    submitFrame: function () { return; }
  };
  return Promise.resolve([mockVRDisplay]);
};

const AFRAME = require('index');
var AScene = require('core/scene/a-scene').AScene;
// Make sure WebGL context is not created since Travix CT runs headless.
// Stubs below failed once in a while due to asynchronous tesst setup / teardown.
AScene.prototype.setupRenderer = function () {};

setup(function () {
  window.AFRAME = AFRAME;
  this.sinon = sinon.createSandbox();
  // Stubs to not create a WebGL context since Travis CI runs headless.
  this.sinon.stub(AScene.prototype, 'render');
  this.sinon.stub(AScene.prototype, 'setupRenderer');
  // Mock renderer.
  AScene.prototype.renderer = {
    xr: {
      getDevice: function () { return {requestPresent: function () {}}; },
      isPresenting: function () { return true; },
      setDevice: function () {},
      setFoveation: function () {},
      setPoseTarget: function () {},
      dispose: function () {},
      enabled: false
    },
    dispose: function () {},
    getContext: function () { return undefined; },
    setAnimationLoop: function () {},
    setSize: function () {},
    setPixelRatio: function () {},
    render: function () {},
    shadowMap: {enabled: false}
  };
});

teardown(function (done) {
  // Clean up any attached elements.
  var attachedEls = ['canvas', 'a-assets', 'a-scene'];
  var els = document.querySelectorAll(attachedEls.join(','));
  for (var i = 0; i < els.length; i++) {
    els[i].parentNode.removeChild(els[i]);
  }
  this.sinon.restore();
  delete AFRAME.components.test;
  delete AFRAME.systems.test;

  // Allow detachedCallbacks to clean themselves up.
  setTimeout(function () {
    done();
  });
});
