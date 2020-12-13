let registerSystem = require('../core/system').registerSystem;
let THREE = require('../lib/three');

/**
 * glTF model system.
 *
 * Configures glTF loading options. Models using glTF compression require that a Draco decoder be
 * provided externally.
 *
 * @param {string} dracoDecoderPath - Base path from which to load Draco decoder library.
 */
module.exports.System = registerSystem('gltf-model', {
  schema: {
    dracoDecoderPath: {default: ''}
  },

  init: function () {
    let path = this.data.dracoDecoderPath;
    this.dracoLoader = new THREE.DRACOLoader();
    this.dracoLoader.setDecoderPath(path);
  },

  update: function () {
    let path;
    if (this.dracoLoader) { return; }
    path = this.data.dracoDecoderPath;
    this.dracoLoader = new THREE.DRACOLoader();
    this.dracoLoader.setDecoderPath(path);
  },

  getDRACOLoader: function () {
    return this.dracoLoader;
  }
});
