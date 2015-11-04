var registerComponent = require('../core/register-component').registerComponent;
var loadSrc = require('../utils/src-loader').loadSrc;
var THREE = require('../../lib/three');
var utils = require('../vr-utils');

/**
 * Material component.
 *
 * @params {string} color - base color of the PBR material
 * @params {number} height - the height of the texture image
 * @params {number} metalness - PBR parameter
 * @params {number} opacity - [0-1].
 * @params {boolean} receiveLight - Determines if the material is shaded
 * @params {number} roughness - PBR parameter
 * @params {string} src - The src to be used as a texture - url() or CSS Selector
 * @params {boolean} transparent - If the alpha channel of a texture image is rendered transparent
 * @params {number} width - the width of the texture image
 * @namespace material
 */
module.exports.Component = registerComponent('material', {
  defaults: {
    value: {
      color: '#FFF',
      height: 360,
      metalness: 0.0,
      opacity: 1.0,
      receiveLight: true,
      roughness: 0.5,
      src: '',
      transparent: false,
      width: 640
    }
  },

  /**
   * Initialize material.
   */
  init: {
    value: function () {
      this.textureSrc = null;
      this.el.object3D.material = this.getMaterial();
    }
  },

  /**
   * Update material.
   */
  update: {
    value: function () {
      this.el.object3D.material = this.getMaterial();
    }
  },

  /**
   * Get or create material.
   * Returned material type depends on receiveLight.
   *   receiveLight: false - MeshBasicMaterial
   *   receiveLight: true - MeshPhysicalMaterial
   *
   * @return {object} material
   */
  getMaterial: {
    value: function () {
      var data = this.data;
      var material;

      if (data.receiveLight) {
        // Physical material.
        material = this.updateOrCreateMaterial({
          color: new THREE.Color(data.color),
          side: this.getSides(),
          opacity: data.opacity,
          transparent: data.opacity < 1,
          metalness: data.metalness,
          roughness: data.roughness
        }, 'MeshPhysicalMaterial');
      } else {
        material = this.updateOrCreateMaterial({
          // Basic material.
          color: new THREE.Color(data.color),
          side: this.getSides(),
          opacity: data.opacity,
          transparent: data.transparent
        }, 'MeshBasicMaterial');
      }

      // Textures.
      var src = data.src;
      if (src) {
        if (src !== this.textureSrc) {
          // Texture added or changed.
          this.textureSrc = src;
          loadSrc(src, this.loadImage.bind(this), this.loadVideo.bind(this));
        }
      } else {
        // Texture removed.
        material.map = null;
        material.needsUpdate = true;
      }
      return material;
    }
  },

  /**
   * Updates this.material using data, creates new material if this.material
   * doesn't yet exist.
   *
   * @params {object} data - attributes to set on the material.
   * @params {string} type - type of material to create (if necessary).
   * @returns {object} material - three.js material based on `type`.
   */
  updateOrCreateMaterial: {
    value: function (data, type) {
      var material = this.material;
      var reuseMaterial = material && material.type === type;
      if (reuseMaterial) {
        Object.keys(data).forEach(function (key) {
          material[key] = data[key];
        });
      } else {
        material = new THREE[type](data);
      }
      this.material = material;
      return material;
    }
  },

  /**
   * Returns an integer for which new material face sides will be rendered.
   *
   * @returns {Integer} `THREE.DoubleSide` (`0`) or `THREE.FrontSide` (`2`)
   */
  getSides: {
    value: function () {
      var geometry = this.el.components.geometry;
      if (geometry && geometry.data.openEnded) {
        // For performance reasons, we special case open-ended cylinders
        // for rendering both faces.
        return THREE.DoubleSide;
      }
      return THREE.FrontSide;
    }
  },

  /**
   * Loads an image to be used as a texture
   *
   * @params {string|object} src - a <img> element or url to an image file
   */
  loadImage: {
    value: function (src) {
      var texture;
      var isEl = typeof src !== 'string';
      if (isEl) {
        texture = new THREE.Texture(src);
        texture.needsUpdate = true;
      } else {
        texture = THREE.ImageUtils.loadTexture(src);
      }
      this.material.needsUpdate = true;
      this.material.map = texture;
    }
  },

  /**
   * It creates a video element to be used as a texture
   *
   * @params {string} src - the url pointing to the video file
   */
  getVideoEl: {
    value: function (src) {
      var el = this.videoEl || document.createElement('video');
      function onError () {
        utils.warn('The url "$s" is not a valid image or video', src);
      }
      el.width = this.data.width;
      el.height = this.data.height;
      // Attach event listeners if brand new video element.
      if (el !== this.videoEl) {
        el.autoplay = true;
        el.loop = true;
        el.crossOrigin = true;
        el.addEventListener('error', onError, true);
        this.videoEl = el;
      }
      el.src = src;
      return el;
    }
  },

  /**
   * Creates a new material object for handling video texture.
   *
   * @params {string|object} src - a <video> element or url to a video file
   */
  loadVideo: {
    value: function (src) {
      var videoEl = typeof src !== 'string' ? src : this.getVideoEl(src);
      var texture = new THREE.VideoTexture(videoEl);
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      this.material.map = texture;
      this.material.needsUpdate = true;
    }
  }
});
