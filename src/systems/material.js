import * as THREE from 'three';
import { registerSystem } from '../core/system.js';
import * as utils from '../utils/index.js';
import { setTextureProperties, createCompatibleTexture } from '../utils/material.js';

var debug = utils.debug;
var error = debug('components:texture:error');
var warn = debug('components:texture:warn');
var ImageLoader = new THREE.ImageLoader();

/**
 * System for material component.
 * Handle material registration, updates (for fog), and texture caching.
 *
 * @member {object} materials - Registered materials.
 * @member {object} sourceCache - Texture source cache for, Image, Video and Canvas sources
 */
export var System = registerSystem('material', {
  init: function () {
    this.materials = {};
    this.sourceCache = {};
  },

  clearTextureSourceCache: function () {
    this.sourceCache = {};
  },

  /**
   * Loads and creates a texture for a given `src`.
   *
   * @param {string|Element} src - URL or element
   * @param {object} data - Relevant texture properties
   * @param {function} cb - Callback to pass texture to
   */
  loadTexture: function (src, data, cb) {
    this.loadTextureSource(src, function sourceLoaded (source) {
      var texture = createCompatibleTexture(source);
      setTextureProperties(texture, data);
      cb(texture);
    });
  },

  /**
   * Determine whether `src` is an image or video. Then try to load the asset, then call back.
   *
   * @param {string|Element} src - URL or element.
   * @param {function} cb - Callback to pass texture source to.
   */
  loadTextureSource: function (src, cb) {
    var self = this;
    var sourceCache = this.sourceCache;

    var hash = this.hash(src);
    if (sourceCache[hash]) {
      sourceCache[hash].then(cb);
      return;
    }

    // Canvas.
    if (src.tagName === 'CANVAS') {
      sourceLoaded(new THREE.Source(src));
      return;
    }

    sourceLoaded(new Promise(doSourceLoad));
    function doSourceLoad (resolve, reject) {
      utils.srcLoader.validateSrc(src, loadImageCb, loadVideoCb);
      function loadImageCb (src) { self.loadImage(src, resolve); }
      function loadVideoCb (src) { self.loadVideo(src, resolve); }
    }

    function sourceLoaded (sourcePromise) {
      sourceCache[hash] = Promise.resolve(sourcePromise);
      sourceCache[hash].then(cb);
    }
  },

  /**
   * Load the six individual sides and construct a cube texture, then call back.
   *
   * @param {Array<string|Element>} srcs - Array of six texture URLs or elements.
   * @param {function} cb - Callback to pass cube texture to.
   */
  loadCubeMapTexture: function (srcs, cb) {
    var self = this;
    var loaded = 0;
    var cube = new THREE.CubeTexture();
    cube.colorSpace = THREE.SRGBColorSpace;

    function loadSide (index) {
      self.loadTextureSource(srcs[index], function (source) {
        cube.images[index] = source.data;
        loaded++;
        if (loaded === 6) {
          cube.needsUpdate = true;
          cb(cube);
        }
      });
    }

    if (srcs.length !== 6) {
      warn('Cube map texture requires exactly 6 sources, got only %s sources', srcs.length);
      return;
    }

    for (var i = 0; i < srcs.length; i++) {
      loadSide(i);
    }
  },

  /**
   * High-level function for loading image textures (THREE.Texture).
   *
   * @param {string|Element} src - Texture source.
   * @param {function} cb - Callback to pass texture to.
   */
  loadImage: function (src, cb) {
    // Image element provided
    if (typeof src !== 'string') {
      cb(new THREE.Source(src));
      return;
    }

    cb(loadImageUrl(src));
  },

  /**
   * Load video texture (THREE.VideoTexture).
   * Which is just an image texture that RAFs + needsUpdate.
   * Note that creating a video texture is synchronous unlike loading an image texture.
   * Made asynchronous to be consistent with image textures.
   *
   * @param {string|Element} src - Texture source.
   * @param {function} cb - Callback to pass texture to.
   */
  loadVideo: function (src, cb) {
    var videoEl;

    // Video element provided.
    if (typeof src !== 'string') {
      // Check cache before creating texture.
      videoEl = src;

      // Fix up the attributes then start to create the texture.
      fixVideoAttributes(videoEl);
    }

    // Only URL provided. Use video element to create texture.
    videoEl = videoEl || createVideoEl(src);

    cb(new THREE.Source(videoEl));
  },

  /**
   * Create a hash for a given source.
   */
  hash: function (src) {
    if (src.tagName) {
      // Prefer element's ID or source, otherwise fallback to the element itself
      return src.id || src.src || src;
    }
    return src;
  },

  /**
   * Keep track of material in case an update trigger is needed (e.g., fog).
   *
   * @param {object} material
   */
  registerMaterial: function (material) {
    this.materials[material.uuid] = material;
  },

  /**
   * Stop tracking material, and dispose of any textures not being used by
   * another material component.
   *
   * @param {object} material
   */
  unregisterMaterial: function (material) {
    delete this.materials[material.uuid];
  }
});

/**
 * Load image from a given URL.
 *
 * @private
 * @param {string} src - An url to an image file.
 * @returns {Promise} Resolves once texture is loaded.
 */
function loadImageUrl (src) {
  return new Promise(doLoadImageUrl);

  function doLoadImageUrl (resolve, reject) {
    // Request and load texture from src string. THREE will create underlying element.
    ImageLoader.load(
      src,
      resolveSource,
      function () { /* no-op */ },
      function (xhr) {
        error('`$s` could not be fetched (Error code: %s; Response: %s)', xhr.status,
              xhr.statusText);
      }
    );

    function resolveSource (data) {
      resolve(new THREE.Source(data));
    }
  }
}

/**
 * Create video element to be used as a texture.
 *
 * @param {string} src - Url to a video file.
 * @returns {Element} Video element.
 */
function createVideoEl (src) {
  var videoEl = document.createElement('video');
  // Support inline videos for iOS webviews.
  videoEl.setAttribute('playsinline', '');
  videoEl.setAttribute('webkit-playsinline', '');
  videoEl.autoplay = true;
  videoEl.loop = true;
  videoEl.crossOrigin = 'anonymous';
  videoEl.addEventListener('error', function () {
    warn('`%s` is not a valid video', src);
  }, true);
  videoEl.src = src;
  return videoEl;
}

/**
 * Fixes a video element's attributes to prevent developers from accidentally passing the
 * wrong attribute values to commonly misused video attributes.
 *
 * <video> does not treat `autoplay`, `controls`, `crossorigin`, `loop`, and `preload` as
 * as booleans. Existence of those attributes will mean truthy.
 *
 * For example, translates <video loop="false"> to <video>.
 *
 * @see https://developer.mozilla.org/docs/Web/HTML/Element/video#Attributes
 * @param {Element} videoEl - Video element.
 * @returns {Element} Video element with the correct properties updated.
 */
function fixVideoAttributes (videoEl) {
  videoEl.autoplay = videoEl.hasAttribute('autoplay') && videoEl.getAttribute('autoplay') !== 'false';
  videoEl.controls = videoEl.hasAttribute('controls') && videoEl.getAttribute('controls') !== 'false';
  if (videoEl.getAttribute('loop') === 'false') {
    videoEl.removeAttribute('loop');
  }
  if (videoEl.getAttribute('preload') === 'false') {
    videoEl.preload = 'none';
  }
  videoEl.crossOrigin = videoEl.crossOrigin || 'anonymous';
  // To support inline videos in iOS webviews.
  videoEl.setAttribute('playsinline', '');
  videoEl.setAttribute('webkit-playsinline', '');
  return videoEl;
}
