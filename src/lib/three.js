var THREE = global.THREE = require('three');
global.glTFParser = require('three/examples/js/loaders/gltf/glTF-parser').glTFParser;

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

// In-memory caching for XHRs (for images, audio files, textures, etc.).
if (THREE.Cache) {
  THREE.Cache.enabled = true;
}

// TODO: Eventually include these only if they are needed by a component.
require('three/examples/js/loaders/OBJLoader');  // THREE.OBJLoader
require('three/examples/js/loaders/MTLLoader');  // THREE.MTLLoader
require('three/examples/js/loaders/ColladaLoader');  // THREE.ColladaLoader
require('three/examples/js/loaders/gltf/glTFLoaderUtils.js'); // THREE.glTFLoaderUtils
require('three/examples/js/loaders/gltf/glTFLoader.js'); // THREE.glTFLoader
require('three/examples/js/loaders/gltf/glTFAnimation.js'); // THREE.glTFAnimator
require('three/examples/js/loaders/gltf/glTFShaders.js'); // THREE.glTFShaders
require('../../vendor/VRControls');  // THREE.VRControls
require('../../vendor/VREffect');  // THREE.VREffect

module.exports = THREE;
