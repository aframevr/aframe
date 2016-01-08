/* global sinon, setup, teardown */

/**
 * __init.test.js is run before every test case.
 */
window.debug = true;

var AScene = require('core/a-scene');

setup(function () {
  this.sinon = sinon.sandbox.create();
  // Stub to not create a WebGL context since Travis CI runs headless.
  this.sinon.stub(AScene.prototype, 'attachedCallback');
});

teardown(function () {
  // Clean up any attached elements.
  ['canvas', 'a-assets', 'a-scene'].forEach(function (tagName) {
    var els = document.querySelectorAll(tagName);
    for (var i = 0; i < els.length; i++) {
      els[i].parentNode.removeChild(els[i]);
    }
  });
  AScene.scene = null;

  this.sinon.restore();
});
