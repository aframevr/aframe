/* global sinon, setup, teardown */
window.debug = true;

var VRScene = require('core/vr-scene');
var THREE = require('vr-markup').THREE;

setup(function () {
  this.sinon = sinon.sandbox.create();
  this.sinon.stub(VRScene.prototype, 'attachedCallback', function () {
    this.object3D = new THREE.Scene();
  });
});

teardown(function () {
  this.sinon.restore();
});
