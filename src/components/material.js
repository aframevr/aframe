/* global Promise */
var debug = require('../utils/debug');
var registerComponent = require('../core/register-component').registerComponent;
var srcLoader = require('../utils/src-loader');
var THREE = require('../../lib/three');

var CubeLoader = new THREE.CubeTextureLoader();
var error = debug('components:material:error');
var TextureLoader = new THREE.TextureLoader();
var texturePromises = {};
var warn = debug('components:material:warn');

/**
 * Material component.
 *
 * @namespace material
 * @params {string} color - Diffuse color.
 * @params {string} envMap - To load a environment cubemap. Takes a selector
 *         to an element containing six img elements, or a comma-separated
 *         string of direct url()s.
 * @params {number} height - Height to render texture.
 * @params {number} metalness - Parameter for physical/standard material.
 * @params {number} opacity - [0-1].
 * @params {number} reflectivity - Parameter for physical/standard material.
 * @params {string} repeat - X and Y value for size of texture repeating
 *         (in UV units).
 * @params {number} roughness - Parameter for physical/standard material.
 * @params {string} [side=front] - Which side(s) to render (i.e., front, back,
 *         both).
 * @params {string} shader - Determines how material is shaded. Defaults to `standard`,
 *         three.js's implementation of PBR. Another option is `flat` where we use
 *         MeshBasicMaterial.
 * @params {string} src - To load a texture. takes a selector to an img/video
 *         element or a direct url().
 * @params {boolean} transparent - Whether to render transparent the alpha
 *         channel of a texture (e.g., .png).
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
      reflectivity: 1.0,
      repeat: '',
      roughness: 0.5,
      shader: 'standard',
      side: 'front',
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
   * Returned material type depends on shader.
   *   shader=flat - MeshBasicMaterial.
   *   shader=XXX - MeshStandardMaterial.
   *
   * @return {object} material
   */
  update: {
    value: function () {
      var data = this.data;
      var isStandardMaterial = data.shader !== 'flat';
      var materialData = {
        color: new THREE.Color(data.color),
        side: getSide(data.side),
        opacity: data.opacity,
        transparent: data.transparent
      };
      var materialType = isStandardMaterial ? 'MeshStandardMaterial' : 'MeshBasicMaterial';
      var src = data.src;

      // Attach standard material parameters.
      if (isStandardMaterial) {
        materialData.metalness = data.metalness;
        materialData.reflectivity = data.reflectivity;
        materialData.roughness = data.roughness;
        materialData.transparent = data.opacity < 1.0;
      }

      // Create or reuse an existing material.
      this.material = this.updateOrCreateMaterialHelper(materialData, materialType);
      this.el.object3D.material = this.material;

      // Load textures and/or cubemaps.
      if (isStandardMaterial) { this.updateEnvMap(); }
      this.updateTexture(src);
    }
  },

  /**
   * Remove material on remove (callback).
   */
  remove: {
    value: function () {
      var el = this.el;
      var object3D = el.object3D;
      if (object3D) { object3D.material = null; }
      el.sceneEl.unregisterMaterial(this.material);
    }
  },

  /**
   * Updates this.material using data, creates new material if this.material doesn't yet
   * exist.
   *
   * @params {object} data - Attributes to set on the material.
   * @params {string} type - Type of material to create (if necessary).
   * @returns {object} material - three.js material based on `type`.
   */
  updateOrCreateMaterialHelper: {
    value: function (data, type) {
      var material = this.material;
      var reuseMaterial = material && material.type === type;
      var sceneEl = this.el.sceneEl;

      if (reuseMaterial) {
        // Updating existing material.
        Object.keys(data).forEach(function (key) {
          material[key] = data[key];
        });
      } else {
        // Creating new material.
        if (this.material) {
          sceneEl.unregisterMaterial(this.material);
        }
        material = new THREE[type](data);
        sceneEl.registerMaterial(material);
      }
      return material;
    }
  },

  /**
   * Handle environment cubemap. Textures are cached in texturePromises.
   */
  updateEnvMap: {
    value: function () {
      var self = this;
      var material = this.material;
      var envMap = this.data.envMap;
      // Environment cubemaps.
      if (!envMap || this.isLoadingEnvMap) {
        material.envMap = null;
        material.needsUpdate = true;
        return;
      }
      this.isLoadingEnvMap = true;
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

  /*
   * Updates material texture map.
   *
   * @param {string|object} src - An <img> / <video> element or url to an image/video file.
   */
  updateTexture: {
    value: function (src) {
      var data = this.data;
      var material = this.material;
      if (src) {
        if (src !== this.textureSrc) {
          // Texture added or changed.
          this.textureSrc = src;
          srcLoader.validateSrc(src, loadImage, loadVideo);
        }
      } else {
        // Texture removed.
        material.map = null;
        material.needsUpdate = true;
      }
      function loadImage (src) { loadImageTexture(material, src, data.repeat); }
      function loadVideo (src) { loadVideoTexture(material, src, data.width, data.height); }
    }
  }
});

/**
 * Sets image texture on material as `map`.
 *
 * @params {object} material - three.js material.
 * @params {string|object} src - An <img> element or url to an image file.
 * @params {string} repeat - X and Y value for size of texture repeating (in UV units).
 */
function loadImageTexture (material, src, repeat) {
  var isEl = typeof src !== 'string';

  var onLoad = createTexture;
  var onProgress = function () {};
  var onError = function (xhr) {
    error('The URL "$s" could not be fetched (Error code: %s; Response: %s)',
          xhr.status, xhr.statusText);
  };

  if (isEl) {
    createTexture(src);
  } else {
    TextureLoader.load(src, onLoad, onProgress, onError);
  }

  function createTexture (texture) {
    if (!(texture instanceof THREE.Texture)) { texture = new THREE.Texture(texture); }
    var repeatXY;
    if (repeat) {
      repeatXY = repeat.split(' ');
      if (repeatXY.length === 2) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(parseInt(repeatXY[0], 10),
                           parseInt(repeatXY[1], 10));
      }
    }
    material.map = texture;
    texture.needsUpdate = true;
    material.needsUpdate = true;
  }
}

/**
 * Creates a video element to be used as a texture.
 *
 * @params {object} material - three.js material.
 * @params {string} src - url to a video file.
 * @params {number} width - width of the video.
 * @params {number} height - height of the video.
 */
function createVideoEl (material, src, width, height) {
  var el = material.videoEl || document.createElement('video');
  function onError () {
    warn('The URL "$s" is not a valid image or video', src);
  }
  el.width = width;
  el.height = height;
  // Attach event listeners if brand new video element.
  if (el !== this.videoEl) {
    el.autoplay = true;
    el.loop = true;
    el.crossOrigin = true;
    el.addEventListener('error', onError, true);
    material.videoEl = el;
  }
  el.src = src;
  return el;
}

/**
 * Sets video texture on material as map.
 * @params {object} material - three.js material.
 * @params {string} src - url to a video file.
 * @params {number} width - width of the video.
 * @params {number} height - height of the video.
 *
*/
function loadVideoTexture (material, src, height, width) {
  // three.js video texture loader requires a <video>.
  var videoEl = typeof src !== 'string' ? src : createVideoEl(material, src, height, width);
  var texture = new THREE.VideoTexture(videoEl);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  material.map = texture;
  material.needsUpdate = true;
}

/**
 * Returns a three.js constant determining which material face sides to render
 * based on the side parameter (passed as a component attribute).
 *
 * @param {string} [side=front] - `front`, `back`, or `double`.
 * @returns {number} THREE.FrontSide, THREE.BackSide, or THREE.DoubleSide.
 */
function getSide (side) {
  switch (side) {
    case 'back': {
      return THREE.BackSide;
    }
    case 'double': {
      return THREE.DoubleSide;
    }
    default: {
      // Including case `front`.
      return THREE.FrontSide;
    }
  }
}
