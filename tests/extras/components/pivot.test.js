/* global assert, process, setup, suite, test */
var helpers = require('../../helpers');
var THREE = require('lib/three');

var positionVec3 = new THREE.Vector3();

suite('pivot', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    el.setAttribute('geometry', {primitive: 'box'});
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('does not translate object', function () {
    var el = this.el;
    el.setAttribute('pivot', '0 0.5 0');
    // Grab world coordinates.
    el.sceneEl.object3D.updateMatrixWorld();
    positionVec3.setFromMatrixPosition(el.getObject3D('mesh').matrixWorld);
    assert.shallowDeepEqual(positionVec3, {x: 0, y: 0, z: 0});
  });

  test('sets proper pivot point', function () {
    var el = this.el;

    // Rotate without pivot, center will stay in place.
    el.setAttribute('rotation', '180 0 0');
    el.sceneEl.object3D.updateMatrixWorld();
    positionVec3.setFromMatrixPosition(el.getObject3D('mesh').matrixWorld);
    assert.shallowDeepEqual(positionVec3.floor(), {x: 0, y: 0, z: 0});

    // Set pivot, check that world position is changed.
    el.setAttribute('pivot', '0 0.5 0');
    el.sceneEl.object3D.updateMatrixWorld();
    positionVec3.setFromMatrixPosition(el.getObject3D('mesh').matrixWorld);
    assert.shallowDeepEqual(positionVec3.floor(), {x: 0, y: 1, z: -1});
  });
});
