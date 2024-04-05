/* global EventTarget, sinon, setup, teardown */

/**
 * __init.test.js is run before every test case.
 */
window.debug = true;

/* WebVR Stub */
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

/* WebXR Stub */
navigator.xr = navigator.xr || {};
navigator.xr.isSessionSupported = function (_sessionType) { return Promise.resolve(true); };
navigator.xr.requestSession = function (_mode) {
  const xrSession = new EventTarget();
  xrSession.supportedFrameRates = [90];
  xrSession.requestReferenceSpace = function () { return Promise.resolve(); };
  return Promise.resolve(xrSession);
};

const AFRAME = require('index');
var AScene = require('core/scene/a-scene').AScene;
// Make sure WebGL context is not created since CI runs headless.
// Stubs below failed once in a while due to asynchronous test setup / teardown.
AScene.prototype.setupRenderer = function () {};

setup(function () {
  window.AFRAME = AFRAME;
  this.sinon = sinon.createSandbox();
  // Stubs to not create a WebGL context since CI runs headless.
  this.sinon.stub(AScene.prototype, 'render');
  this.sinon.stub(AScene.prototype, 'setupRenderer');
  // Mock renderer.
  AScene.prototype.renderer = {
    xr: {
      getDevice: function () { return {requestPresent: function () {}}; },
      isPresenting: function () { return true; },
      setDevice: function () {},
      setSession: function () { return Promise.resolve(); },
      setFoveation: function () {},
      setPoseTarget: function () {},
      dispose: function () {},
      setReferenceSpaceType: function () {},
      enabled: false
    },
    dispose: function () {},
    getContext: function () { return undefined; },
    render: function () {},
    setAnimationLoop: function () {},
    setOpaqueSort: function () {},
    setPixelRatio: function () {},
    setSize: function () {},
    setTransparentSort: function () {},
    shadowMap: {enabled: false}
  };
});

// Ensure that uncaught exceptions between tests result in the tests failing.
// This works around an issue with mocha / karma-mocha, see
// https://github.com/karma-runner/karma-mocha/issues/227
var pendingError = null;
var pendingErrorNotice = null;

window.addEventListener('error', event => {
  pendingError = event.error;
  pendingErrorNotice = 'An uncaught exception was thrown between tests';
});
window.addEventListener('unhandledrejection', event => {
  pendingError = event.reason;
  pendingErrorNotice = 'An uncaught promise rejection occurred between tests';
});

teardown(function () {
  // Clean up any attached elements.
  var attachedEls = ['canvas', 'a-assets', 'a-scene'];
  var els = document.querySelectorAll(attachedEls.join(','));
  for (var i = 0; i < els.length; i++) {
    els[i].parentNode.removeChild(els[i]);
  }
  this.sinon.restore();
  delete AFRAME.components.test;
  delete AFRAME.systems.test;

  if (pendingError) {
    console.error(pendingErrorNotice);
    throw pendingError;
  }
});
