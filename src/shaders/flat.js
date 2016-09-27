var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');
var utils = require('../utils/');

/**
 * Flat shader using THREE.MeshBasicMaterial.
 */
module.exports.Component = registerShader('flat', {
  schema: {
    color: {type: 'color'},
    fog: {default: true},
    height: {default: 256},
    repeat: {default: ''},
    src: {default: ''},
    width: {default: 512}
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.textureSrc = null;
    this.material = new THREE.MeshBasicMaterial(getMaterialData(data));
    utils.material.updateMap(this, data);
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
    fog: data.fog,
    color: new THREE.Color(data.color)
  };
}
