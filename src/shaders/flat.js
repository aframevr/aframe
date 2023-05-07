var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');
var utils = require('../utils/');

/**
 * Flat shader using THREE.MeshBasicMaterial.
 */
module.exports.Shader = registerShader('flat', {
  schema: {
    color: {type: 'color'},
    fog: {default: true},
    height: {default: 256},
    offset: {type: 'vec2', default: {x: 0, y: 0}},
    repeat: {type: 'vec2', default: {x: 1, y: 1}},
    src: {type: 'map'},
    width: {default: 512},
    wireframe: {default: false},
    wireframeLinewidth: {default: 2},
    toneMapped: {default: true}
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.materialData = {color: new THREE.Color()};
    this.textureSrc = null;
    getMaterialData(data, this.materialData);
    this.material = new THREE.MeshBasicMaterial(this.materialData);
  },

  update: function (data) {
    this.updateMaterial(data);
    utils.material.updateMap(this, data);
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   */
  updateMaterial: function (data) {
    var key;
    getMaterialData(data, this.materialData);
    for (key in this.materialData) {
      this.material[key] = this.materialData[key];
    }
  }
});

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @param {object} materialData - Object to reuse.
 * @returns {object} Updated material data.
 */
function getMaterialData (data, materialData) {
  materialData.color.set(data.color);
  materialData.fog = data.fog;
  materialData.wireframe = data.wireframe;
  materialData.toneMapped = data.toneMapped;
  materialData.wireframeLinewidth = data.wireframeLinewidth;
  return materialData;
}
