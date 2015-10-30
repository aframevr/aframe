var THREE = require('three-dev');

// Allow cross-origin images to be loaded.
if (THREE.ImageUtils) {
  THREE.ImageUtils.crossOrigin = '';
}

// TODO: Eventually include these only if they are needed by a component.
THREE.Raycaster = require('../lib/vendor/Raycaster')(THREE);
THREE.VRControls = require('../lib/vendor/VRControls');
THREE.VREffect = require('../lib/vendor/VREffect');

module.exports = THREE;
