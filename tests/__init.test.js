/* global sinon, setup, teardown */

/**
 * __init.test.js is run before every test suite.
 */
window.debug = true;

var VRScene = require('core/vr-scene');

setup(function () {
  this.sinon = sinon.sandbox.create();
  this.sinon.stub(VRScene.prototype, 'attachedCallback');
});

teardown(function () {
  // Clean up any attached elements.
  ['vr-assets', 'vr-scene'].forEach(function (tagName) {
    var els = document.querySelectorAll(tagName);
    for (var i = 0; i < els.length; i++) {
      els[i].parentNode.removeChild(els[i]);
    }
  });

  this.sinon.restore();
});
