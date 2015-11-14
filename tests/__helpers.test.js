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

/**
 * Helper method to create a scene, create an object, add object to scene,
 * add scene to document.
 *
 * @returns {object} A <vr-object> element.
 */
global.entityFactory = function () {
  var scene = document.createElement('vr-scene');
  var object = document.createElement('vr-object');
  scene.appendChild(object);
  document.body.appendChild(scene);
  return object;
}
