var THREE = require('three-dev');

// Allow cross-origin images to be loaded.
if (THREE.TextureLoader) {
  THREE.TextureLoader.prototype.crossOrigin = '';
}

// TODO: Eventually include these only if they are needed by a component.
THREE.OBJLoader = require('../lib/vendor/OBJLoader')(THREE);
THREE.ColladaLoader = require('../lib/vendor/ColladaLoader')(THREE);
THREE.Raycaster = require('../lib/vendor/Raycaster')(THREE);
THREE.VRControls = require('../lib/vendor/VRControls');
THREE.VREffect = require('../lib/vendor/VREffect');

module.exports = THREE;
