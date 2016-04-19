var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');
var utils = require('../utils/');

/**
 * Flat shader using THREE.MeshBasicMaterial.
 */
module.exports.Component = registerShader('flat', {
  schema: {
    color: { type: 'color' },
    height: { default: 256 },
    repeat: { default: '' },
    src: { default: '' },
    width: { default: 512 }
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.textureSrc = null;
    this.material = new THREE.MeshBasicMaterial(getMaterialData(data));
    this.updateTexture(data);
    return this.material;
  },

  update: function (data) {
    this.updateMaterial(data);
    this.updateTexture(data);
    return this.material;
  },

  /**
   * Update or create material.
   *
   * @param {object|null} oldData
   */
  updateTexture: function (data) {
    var el = this.el;
    var src = data.src;
    var material = this.material;
    var materialSystem = el.sceneEl.systems.material;

    if (src) {
      if (src === this.textureSrc) { return; }
      // Texture added or changed.
      this.textureSrc = src;
      utils.srcLoader.validateSrc(
        src,
        function loadImageCb (src) { materialSystem.loadImage(el, material, data, src); },
        function loadVideoCb (src) { materialSystem.loadVideo(el, material, data, src); }
      );
      return;
    }

    // Texture removed.
    utils.material.updateMaterialTexture(material, null);
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   */
  updateMaterial: function (data) {
    var material = this.material;
    data = getMaterialData(data);
    Object.keys(data).forEach(function (key) {
      material[key] = data[key];
    });
  }
});

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @returns {object} data - Processed material data.
 */
function getMaterialData (data) {
  return {
    color: new THREE.Color(data.color)
  };
}
