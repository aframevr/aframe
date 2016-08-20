var THREE = require('../lib/three');
var dummyDolly = new THREE.Object3D();
var controls = new THREE.VRControls(dummyDolly);

/**
 * Determine if a headset is connected by checking if the
 * orientation is available
 */
module.exports = function checkHeadsetConnected () {
  var orientation;
  controls.update();
  orientation = dummyDolly.quaternion;
  if (orientation._x !== 0 || orientation._y !== 0 || orientation._z !== 0) {
    return true;
  }
};
