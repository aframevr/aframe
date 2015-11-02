var registerComponent = require('../core/register-component').registerComponent;
var loadSrc = require('../src-loader').loadSrc;
var THREE = require('../../lib/three');
var utils = require('../vr-utils');

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
      height: 360,
      metalness: 0.0,
      opacity: 1.0,
      roughness: 0.5,
      width: 640
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

  /**
   * Update material.
   * Support switching between basic/texture and physical material.
   */
  update: {
    value: function () {
      this.el.object3D.material = this.getMaterial();
    }
  },

  /**
   * Creates a new material, type depending on the component attributes.
   *
   * @return {object} material
   */
  getMaterial: {
    value: function () {
      var src = this.data.src;
      if (src) {
        return this.setupTextureMaterial(src);
      } else {
        return this.setupPhysicalMaterial();
      }
    }
  },

  /**
   * Setups a material and loads the video or an image to be used as
   * as a texture
   *
   * @params {string} src where the texture is located
   */
  setupTextureMaterial: {
    value: function (src) {
      var material = this.setupBasicMaterial();
      // loads image or video
      loadSrc(src, this.loadImage.bind(this),
                   this.loadVideo.bind(this));
      return material;
    }
  },

  /**
   * Generic function to create materials.
   * It tries to reuse the cached material if posible
   *
   * @params {string} data attributes of the material
   * @params {string} type type of the material to be created
   *
   * @returns {object} material - three.js based on the passed type.
   */
  setupMaterial: {
    value: function (data, type) {
      var material = this.material;
      var reuseMaterial = material && material.type === type;
      material = reuseMaterial ? material : new THREE[type](data);
      Object.keys(data).forEach(function (key) {
        material[key] = data[key];
      });
      this.material = material;
      return material;
    }
  },

  /**
   * Creates a new material object for handling textures.
   *
   * @returns {object} material - three.js MeshBasicMaterial.
   */
  setupBasicMaterial: {
    value: function () {
      var data = this.data;
      return this.setupMaterial({
        color: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
        opacity: data.opacity,
        transparent: data.opacity < 1
      }, 'MeshBasicMaterial');
    }
  },

  /**
   * Creates a physical material.
   *
   * @returns {object} material - three.js MeshPhysicalMaterial.
   */
  setupPhysicalMaterial: {
    value: function () {
      var data = this.data;
      return this.setupMaterial({
        color: new THREE.Color(data.color),
        opacity: data.opacity,
        transparent: data.opacity < 1,
        metalness: data.metalness,
        roughness: data.roughness
      }, 'MeshPhysicalMaterial');
    }
  },

  /**
   * Updates an existing physical material.
   */
  updatePhysicalMaterial: {
    value: function () {
      var data = this.data;
      var material = this.el.object3D.material;
      data.color = new THREE.Color(data.color);
      Object.keys(data).forEach(function (key) {
        material[key] = data[key];
      });
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
      // If it's a brand new video element we need to attach
      // event listeners.
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
