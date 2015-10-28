var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

var MATERIAL_TYPE__PBR = 'MeshPhysicalMaterial';

/**
 * Material component.
 *
 * @params {string} color
 * @params {number} metalness
 * @params {number} opacity - [0-1].
 * @params {number} roughness
 * @namespace material
 */
module.exports.Component = registerComponent('material', {
  defaults: {
    value: {
      color: 'red',
      metalness: 0.0,
      opacity: 1.0,
      roughness: 0.5
    }
  },

  /**
   * Initialize material.
   */
  init: {
    value: function () {
      this.el.object3D.material = this.getMaterial();
    }
  },

  update: {
    value: function () {
      this.el.object3D.material = this.getMaterial();
    }
  },

  /**
   * Recompile shader (e.g., number or types of lights in the scene changes).
   */
  refresh: {
    value: function () {
      this.el.object3D.material.needsUpdate = true;
    }
  },

  getMaterial: {
    value: function () {
      var currentMaterial = this.el.object3D.material;
      var url = this.data.url;
      var isPBR = currentMaterial &&
                  currentMaterial.type === MATERIAL_TYPE__PBR;
      if (url) { return this.getTextureMaterial(); }
      if (isPBR) { return currentMaterial; }
      return this.getPBRMaterial();
    }
  },

  /**
   * Creates a new material object for handling textures.
   *
   * @returns {object} material - three.js MeshBasicMaterial.
   */
  getTextureMaterial: {
    value: function () {
      var data = this.data;
      var texture = THREE.ImageUtils.loadTexture(data.url);
      return new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        opacity: data.opacity,
        transparent: data.opacity < 1,
        map: texture
      });
    }
  },

  /**
   * Creates a physical material.
   *
   * @returns {object} material - three.js MeshPhysicalMaterial.
   */
  getPBRMaterial: {
    value: function () {
      var data = this.data;
      data.transparent = data.opacity < 1;
      return new THREE.MeshPhysicalMaterial(data);
    }
  }
});
