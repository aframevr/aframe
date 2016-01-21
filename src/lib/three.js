var THREE = global.THREE = require('three-dev');

// Allow cross-origin images to be loaded.

// This should not be on `THREE.Loader` nor `THREE.ImageUtils`.
// Must be on `THREE.TextureLoader`.
if (THREE.TextureLoader) {
  THREE.TextureLoader.prototype.crossOrigin = '';
}

// This is for images loaded from the model loaders.
if (THREE.ImageLoader) {
  THREE.ImageLoader.prototype.crossOrigin = '';
}

// TODO: Eventually include these only if they are needed by a component.
require('../../node_modules/three-dev/examples/js/loaders/OBJLoader');  // THREE.OBJLoader
require('../../node_modules/three-dev/examples/js/loaders/MTLLoader');  // THREE.MTLLoader
require('../../node_modules/three-dev/examples/js/loaders/ColladaLoader');  // THREE.ColladaLoader
require('../../vendor/Raycaster');  // THREE.Raycaster
require('../../node_modules/three-dev/examples/js/controls/VRControls');  // THREE.VRControls
require('../../node_modules/three-dev/examples/js/effects/VREffect');  // THREE.VREffect

module.exports = THREE;
