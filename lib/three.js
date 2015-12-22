var THREE = global.THREE = require('three-dev');

// Allow cross-origin images to be loaded.
if (THREE.TextureLoader) {
  THREE.TextureLoader.prototype.crossOrigin = '';
}

// TODO: Eventually include these only if they are needed by a component.

require('../node_modules/three-dev/examples/js/loaders/OBJLoader');  // THREE.OBJLoader
require('../node_modules/three-dev/examples/js/loaders/ColladaLoader');  // THREE.ColladaLoader
require('../lib/vendor/Raycaster');  // THREE.Raycaster
require('../node_modules/three-dev/examples/js/controls/VRControls');  // THREE.VRControls
require('../node_modules/three-dev/examples/js/effects/VREffect');  // THREE.VREffect

module.exports = THREE;
