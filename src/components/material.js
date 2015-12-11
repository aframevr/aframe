/* global Promise */
var debug = require('../utils/debug');
var diff = require('../utils').diff;
var registerComponent = require('../core/component').registerComponent;
var srcLoader = require('../utils/src-loader');
var THREE = require('../../lib/three');

var CubeLoader = new THREE.CubeTextureLoader();
var error = debug('components:material:error');
var TextureLoader = new THREE.TextureLoader();
var texturePromises = {};
var warn = debug('components:material:warn');

var MATERIAL_TYPE_BASIC = 'MeshBasicMaterial';
var MATERIAL_TYPE_STANDARD = 'MeshStandardMaterial';

/**
 * Material component.
 *
 * @namespace material
 * @param {string} color - Diffuse color.
 * @param {string} envMap - To load a environment cubemap. Takes a selector
 *         to an element containing six img elements, or a comma-separated
 *         string of direct url()s.
 * @param {boolean} fog - Whether or not to be affected by fog.
 * @param {number} height - Height to render texture.
 * @param {number} metalness - Parameter for physical/standard material.
 * @param {number} opacity - [0-1].
 * @param {number} reflectivity - Parameter for physical/standard material.
 * @param {string} repeat - X and Y value for size of texture repeating
 *         (in UV units).
 * @param {number} roughness - Parameter for physical/standard material.
 * @param {string} [side=front] - Which side(s) to render (i.e., front, back,
 *         both).
 * @param {string} shader - Determines how material is shaded. Defaults to `standard`,
 *         three.js's implementation of PBR. Another option is `flat` where we use
 *         MeshBasicMaterial.
 * @param {string} src - To load a texture. takes a selector to an img/video
 *         element or a direct url().
 * @param {boolean} transparent - Whether to render transparent the alpha
 *         channel of a texture (e.g., .png).
 * @param {number} width - Width to render texture.
 */
module.exports.Component = registerComponent('material', {
  schema: {
    color: { default: '#FFF' },
    envMap: { default: '' },
    fog: { default: true },
    height: { default: 360 },
    metalness: { default: 0.0, min: 0.0, max: 1.0, if: { shader: ['standard'] } },
    opacity: { default: 1.0, min: 0.0, max: 1.0 },
    reflectivity: { default: 1.0, min: 0.0, max: 1.0, if: { shader: ['standard'] } },
    repeat: { default: '' },
    roughness: { default: 0.5, min: 0.0, max: 1.0, if: { shader: ['standard'] } },
    shader: { default: 'standard', oneOf: ['flat', 'standard'] },
    side: { default: 'front', oneOf: ['front', 'back', 'double'] },
    src: { default: '' },
    transparent: { default: false },
    width: { default: 640 }
  },

  init: function () {
    this.isLoadingEnvMap = false;
    this.material = null;
    this.textureSrc = null;
  },

  /**
   * Update or create material.
   *
   * Material type depends on shader:
   *   shader=flat - MeshBasicMaterial.
   *   shader=XXX - MeshStandardMaterial.
   *
   * @param {object|null} oldData
   */
  update: function (oldData) {
    var data = this.data;
    var material;
    var materialType = getMaterialType(data);
    var src = data.src;

    if (!oldData || getMaterialType(oldData) !== materialType) {
      material = this.createMaterial(getMaterialData(data), materialType);
    } else {
      material = this.updateMaterial(processMaterialData(diff(oldData, data)));
    }

    // Load textures and/or cubemaps.
    if (material.type === MATERIAL_TYPE_STANDARD) { this.updateEnvMap(); }
    this.updateTexture(src);
  },

  /**
   * Remove material on remove (callback).
   */
  remove: function () {
    var el = this.el;
    var defaultColor = this.schema.color.default;
    var defaultMaterial = new THREE.MeshBasicMaterial({ color: defaultColor });
    var object3D = el.object3D;
    if (object3D) { object3D.material = defaultMaterial; }
    el.sceneEl.unregisterMaterial(this.material);
  },

  /**
   * (Re)create new material. Has side-effects of setting `this.material` and updating
   * material registration in scene.
   *
   * @param {object} data - Material component data.
   * @param {object} type - Material type to create.
   * @returns {object} Material.
   */
  createMaterial: function (data, type) {
    var material;
    var sceneEl = this.el.sceneEl;
    if (this.material) {
      sceneEl.unregisterMaterial(this.material);
    }
    material = this.material = this.el.object3D.material = new THREE[type](data);
    sceneEl.registerMaterial(material);
    return material;
  },

  /**
   * Updating existing material.
   *
   * @param {object} data - Material component data.
   * @returns {object} Material.
   */
  updateMaterial: function (data) {
    var material = this.material;
    Object.keys(data).forEach(function (key) {
      material[key] = data[key];
    });
    return material;
  },

  /**
   * Handle environment cubemap. Textures are cached in texturePromises.
   */
  updateEnvMap: function () {
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
  },

  /*
   * Updates material texture map.
   *
   * @param {string|object} src - An <img> / <video> element or url to an image/video file.
   */
  updateTexture: function (src) {
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
});

/**
 * Sets image texture on material as `map`.
 *
 * @param {object} material - three.js material.
 * @param {string|object} src - An <img> element or url to an image file.
 * @param {string} repeat - X and Y value for size of texture repeating (in UV units).
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
 * @param {object} material - three.js material.
 * @param {string} src - Url to a video file.
 * @param {number} width - Width of the video.
 * @param {number} height - Height of the video.
 * @returns {Element} Video element.
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
 *
 * @param {object} material - three.js material.
 * @param {string} src - Url to a video file.
 * @param {number} width - Width of the video.
 * @param {number} height - Height of the video.
*/
function loadVideoTexture (material, src, height, width) {
  // three.js video texture loader requires a <video>.
  var videoEl = typeof src !== 'string' ? fixVideoAttributes(src) : createVideoEl(material, src, height, width);
  var texture = new THREE.VideoTexture(videoEl);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  material.map = texture;
  material.needsUpdate = true;
}

/**
 * Fixes a video element's attributes to prevent developers from accidentally
 * passing the wrong attribute values to commonly misused video attributes.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#Attributes
 * @param {Element} videoEl - Video element.
 * @returns {Element} Video element with the correct properties updated.
 */
function fixVideoAttributes (videoEl) {
  // The `<video>` element treats `loop` and `muted` as boolean attributes, but
  // of course does not with `autoplay`, `controls`, `preload` (and `crossorigin`).
  // If we get passed a `<video autoplay="false">`, let's assume the dev wanted
  // `autoplay` to be disabled.
  videoEl.autoplay = videoEl.getAttribute('autoplay') !== 'false';
  videoEl.controls = videoEl.getAttribute('controls') !== 'false';
  if (videoEl.getAttribute('preload') === 'false') {
    videoEl.preload = 'none';
  }
  return videoEl;
}

/**
 * Builds and normalize material data, normalizing stuff along the way.
 *
 * @param {object} data - Material data.
 * @returns {object} data - Processed material data.
 */
function getMaterialData (data) {
  var materialData = {
    color: data.color,
    side: data.side,
    opacity: data.opacity,
    transparent: data.transparent !== false || data.opacity < 1.0
  };
  if (getMaterialType(data) === MATERIAL_TYPE_STANDARD) {
    // Attach standard material parameters.
    materialData.metalness = data.metalness;
    materialData.reflectivity = data.reflectivity;
    materialData.roughness = data.roughness;
  }
  return processMaterialData(materialData);
}

/**
 * Necessary transforms to material data before passing to three.js.
 *
 * @param {object} data - Material data.
 * @returns {object} Processed material data.
 */
function processMaterialData (data) {
  if ('color' in data) {
    data.color = new THREE.Color(data.color);
  }
  if ('opacity' in data && data.opacity < 1) {
    data.transparent = true;
  }
  if ('side' in data) {
    data.side = getSide(data.side);
  }
  return data;
}

/**
 * Get material type based on shader.
 *
 * @param {object} Material component data.
 * @returns {string} Material type (as three.js constructor name)
 */
function getMaterialType (data) {
  return data.shader === 'flat' ? MATERIAL_TYPE_BASIC : MATERIAL_TYPE_STANDARD;
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
