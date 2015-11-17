/* global Promise */
var registerComponent = require('../core/register-component').registerComponent;
var srcLoader = require('../utils/src-loader');
var THREE = require('../../lib/three');
var utils = require('../vr-utils');

var CubeLoader = new THREE.CubeTextureLoader();
var texturePromises = {};

/**
 * Material component.
 *
 * @namespace material
 * @params {string} color - Diffuse color.
 * @params {string} envMap - To load a environment cubemap. Takes a selector
           to an element containing six img elements, or a comma-separated
           string of direct url()s.
 * @params {number} height - Height to render texture.
 * @params {number} metalness - Parameter for physical/standard material.
 * @params {number} opacity - [0-1].
 * @params {boolean} receiveLight - Determines whether the material is shaded.
 * @params {number} reflectivity - Parameter for physical/standard material.
 * @params {string} repeat - X and Y value for size of texture repeating
           (in UV units).
 * @params {number} roughness - Parameter for physical/standard material.
 * @params {string} src - To load a texture. takes a selector to an img/video
           element or a direct url().
 * @params {boolean} transparent - Whether to render transparent the alpha
           channel of a texture (e.g., .png).
 * @params {number} width - Width to render texture.
 */
module.exports.Component = registerComponent('material', {
  defaults: {
    value: {
      color: '#FFF',
      envMap: '',
      height: 360,
      metalness: 0.0,
      opacity: 1.0,
      receiveLight: true,
      reflectivity: 1.0,
      repeat: '',
      roughness: 0.5,
      src: '',
      transparent: false,
      width: 640
    }
  },

  init: {
    value: function () {
      this.textureSrc = null;
      this.isLoadingEnvMap = false;
      this.material = null;
    }
  },

  /**
   * Update or create material.
   * Returned material type depends on receiveLight.
   *   receiveLight: false - MeshBasicMaterial.
   *   receiveLight: true - MeshStandardMaterial.
   *
   * @return {object} material
   */
  update: {
    value: function () {
      var data = this.data;
      var material;

      if (data.receiveLight) {
        // Physical material.
        material = this.updateOrCreateMaterialHelper({
          color: new THREE.Color(data.color),
          side: this.getSides(),
          opacity: data.opacity,
          transparent: data.opacity < 1,
          metalness: data.metalness,
          reflectivity: data.reflectivity,
          roughness: data.roughness
        }, 'MeshStandardMaterial');
        // Environment cubemaps.
        if (data.envMap && !this.isLoadingEnvMap) {
          this.loadEnvMap(material, data.envMap);
        } else {
          material.envMap = null;
          material.needsUpdate = true;
        }
      } else {
        material = this.updateOrCreateMaterialHelper({
          // Basic material.
          color: new THREE.Color(data.color),
          side: this.getSides(),
          opacity: data.opacity,
          transparent: data.transparent
        }, 'MeshBasicMaterial');
      }

      this.el.object3D.material = this.material = material;

      // Textures.
      var src = data.src;
      if (src) {
        if (src !== this.textureSrc) {
          // Texture added or changed.
          this.textureSrc = src;
          srcLoader.validateSrc(src, this.loadImage.bind(this),
                                this.loadVideo.bind(this));
        }
      } else {
        // Texture removed.
        material.map = null;
        material.needsUpdate = true;
      }
    }
  },

  /**
   * Remove material on remove (callback).
   */
  remove: {
    value: function () {
      var object3D = this.el.object3D;
      if (object3D) { object3D.material = null; }
    }
  },

  /**
   * Updates this.material using data, creates new material if this.material
   * doesn't yet exist.
   *
   * @params {object} data - Attributes to set on the material.
   * @params {string} type - Type of material to create (if necessary).
   * @returns {object} material - three.js material based on `type`.
   */
  updateOrCreateMaterialHelper: {
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
   * Handle environment cubemap. Textures are cached in texturePromises.
   *
   * @param {object} material - three.js material.
   * @param {string} envMap - Query selector or comma-separated list of url()s.
   */
  loadEnvMap: {
    value: function (material, envMap) {
      var self = this;
      self.isLoadingEnvMap = true;
      if (texturePromises[envMap]) {
        // Another material is already loading this texture. Wait on promise.
        texturePromises[envMap].then(function (cube) {
          self.isLoadingEnvMap = false;
          material.envMap = cube;
          material.needsUpdate = true;
        });
      } else {
        // Material is first to load this texture. Load and resolve texture.
        texturePromises[envMap] = new Promise(function (resolve) {
          srcLoader.validateCubemapSrc(envMap, function loadEnvMap (urls) {
            CubeLoader.load(urls, function (cube) {
              // Texture loaded.
              self.isLoadingEnvMap = false;
              material.envMap = cube;
              resolve(cube);
            });
          });
        });
      }
    }
  },

  /**
   * Sets image texture on material as map.
   *
   * @params {string|object} src - An <img> element or url to an image file.
   */
  loadImage: {
    value: function (src) {
      var repeat = this.data.repeat;
      var repeatXY;
      var texture;
      var isEl = typeof src !== 'string';
      if (isEl) {
        texture = new THREE.Texture(src);
        texture.needsUpdate = true;
      } else {
        texture = THREE.ImageUtils.loadTexture(src);
      }
      if (repeat) {
        repeatXY = repeat.split(' ');
        if (repeatXY.length === 2) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(parseInt(repeatXY[0], 10),
                             parseInt(repeatXY[1], 10));
        }
      }
      this.material.needsUpdate = true;
      this.material.map = texture;
    }
  },

  /**
   * Creates a video element to be used as a texture.
   *
   * @params {string} src - the url pointing to the video file.
   */
  createVideoEl: {
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
   * Sets video texture on material as map.
   *
   * @params {string|object} src - A <video> element or url to a video file.
   */
  loadVideo: {
    value: function (src) {
      // three.js video texture loader requires a <video>.
      var videoEl = typeof src !== 'string' ? src : this.createVideoEl(src);
      var texture = new THREE.VideoTexture(videoEl);
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      this.material.map = texture;
      this.material.needsUpdate = true;
    }
  }
});
