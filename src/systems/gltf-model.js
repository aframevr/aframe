var registerSystem = require('../core/system').registerSystem;
var THREE = require('../lib/three');

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
    var path = this.data.dracoDecoderPath;
    THREE.DRACOLoader.setDecoderPath(path);
    this.dracoLoader = path ? new THREE.DRACOLoader() : null;
  },

  update: function () {
    var path;
    if (this.dracoLoader) { return; }
    path = this.data.dracoDecoderPath;
    THREE.DRACOLoader.setDecoderPath(path);
    this.dracoLoader = path ? new THREE.DRACOLoader() : null;
  },

  getDRACOLoader: function () {
    return this.dracoLoader;
  }
});
