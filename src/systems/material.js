var registerSystem = require('../core/system').registerSystem;
var THREE = require('../lib/three');
var utils = require('../utils/');
var isHLS = require('../utils/material').isHLS;
var setTextureProperties = require('../utils/material').setTextureProperties;

var bind = utils.bind;
var debug = utils.debug;
var error = debug('components:texture:error');
var TextureLoader = new THREE.TextureLoader();
var warn = debug('components:texture:warn');

TextureLoader.setCrossOrigin('anonymous');

/**
 * System for material component.
 * Handle material registration, updates (for fog), and texture caching.
 *
 * @member {object} materials - Registered materials.
 * @member {object} textureCounts - Number of times each texture is used. Tracked
 *         separately from textureCache, because the cache (1) is populated in
 *         multiple places, and (2) may be cleared at any time.
 * @member {object} textureCache - Texture cache for:
 *   - Images: textureCache has mapping of src -> repeat -> cached three.js texture.
 *   - Videos: textureCache has mapping of videoElement -> cached three.js texture.
 */
module.exports.System = registerSystem('material', {
  init: function () {
    this.materials = {};
    this.textureCounts = {};
    this.textureCache = {};

    this.sceneEl.addEventListener(
      'materialtextureloaded',
      bind(this.onMaterialTextureLoaded, this)
    );
  },

  clearTextureCache: function () {
    this.textureCache = {};
  },

  /**
   * Determine whether `src` is a image or video. Then try to load the asset, then call back.
   *
   * @param {string, or element} src - Texture URL or element.
   * @param {string} data - Relevant texture data used for caching.
   * @param {function} cb - Callback to pass texture to.
   */
  loadTexture: function (src, data, cb) {
    var self = this;

    // Canvas.
    if (src.tagName === 'CANVAS') {
      this.loadCanvas(src, data, cb);
      return;
    }

    // Video element.
    if (src.tagName === 'VIDEO') {
      if (!src.src && !src.srcObject && !src.childElementCount) {
        warn('Video element was defined with neither `source` elements nor `src` / `srcObject` attributes.');
      }
      this.loadVideo(src, data, cb);
      return;
    }

    utils.srcLoader.validateSrc(src, loadImageCb, loadVideoCb);
    function loadImageCb (src) { self.loadImage(src, data, cb); }
    function loadVideoCb (src) { self.loadVideo(src, data, cb); }
  },

  /**
   * High-level function for loading image textures (THREE.Texture).
   *
   * @param {Element|string} src - Texture source.
   * @param {object} data - Texture data.
   * @param {function} cb - Callback to pass texture to.
   */
  loadImage: function (src, data, handleImageTextureLoaded) {
    var hash = this.hash(data);
    var textureCache = this.textureCache;

    // Texture already being loaded or already loaded. Wait on promise.
    if (textureCache[hash]) {
      textureCache[hash].then(handleImageTextureLoaded);
      return;
    }

    // Texture not yet being loaded. Start loading it.
    textureCache[hash] = loadImageTexture(src, data);
    textureCache[hash].then(handleImageTextureLoaded);
  },

  /**
   * High-level function for loading canvas textures (THREE.Texture).
   *
   * @param {Element|string} src - Texture source.
   * @param {object} data - Texture data.
   * @param {function} cb - Callback to pass texture to.
   */
  loadCanvas: function (src, data, cb) {
    var texture;
    texture = new THREE.CanvasTexture(src);
    setTextureProperties(texture, data);
    cb(texture);
  },

    /**
   * Load video texture (THREE.VideoTexture).
   * Which is just an image texture that RAFs + needsUpdate.
   * Note that creating a video texture is synchronous unlike loading an image texture.
   * Made asynchronous to be consistent with image textures.
   *
   * @param {Element|string} src - Texture source.
   * @param {object} data - Texture data.
   * @param {function} cb - Callback to pass texture to.
   */
  loadVideo: function (src, data, cb) {
    var hash;
    var texture;
    var textureCache = this.textureCache;
    var videoEl;
    var videoTextureResult;

    function handleVideoTextureLoaded (result) {
      result.texture.needsUpdate = true;
      cb(result.texture, result.videoEl);
    }

    // Video element provided.
    if (typeof src !== 'string') {
      // Check cache before creating texture.
      videoEl = src;
      hash = this.hashVideo(data, videoEl);
      if (textureCache[hash]) {
        textureCache[hash].then(handleVideoTextureLoaded);
        return;
      }
      // If not in cache, fix up the attributes then start to create the texture.
      fixVideoAttributes(videoEl);
    }

    // Only URL provided. Use video element to create texture.
    videoEl = videoEl || createVideoEl(src, data.width, data.height);

    // Generated video element already cached. Use that.
    hash = this.hashVideo(data, videoEl);
    if (textureCache[hash]) {
      textureCache[hash].then(handleVideoTextureLoaded);
      return;
    }

    // Create new video texture.
    texture = new THREE.VideoTexture(videoEl);
    texture.minFilter = THREE.LinearFilter;
    setTextureProperties(texture, data);

    // If iOS and video is HLS, do some hacks.
    if (this.sceneEl.isIOS &&
        isHLS(videoEl.src || videoEl.getAttribute('src'),
              videoEl.type || videoEl.getAttribute('type'))) {
      // Actually BGRA. Tell shader to correct later.
      texture.format = THREE.RGBAFormat;
      texture.needsCorrectionBGRA = true;
      // Apparently needed for HLS. Tell shader to correct later.
      texture.flipY = false;
      texture.needsCorrectionFlipY = true;
    }

    // Cache as promise to be consistent with image texture caching.
    videoTextureResult = {texture: texture, videoEl: videoEl};
    textureCache[hash] = Promise.resolve(videoTextureResult);
    handleVideoTextureLoaded(videoTextureResult);
  },

  /**
   * Create a hash of the material properties for texture cache key.
   */
  hash: function (data) {
    if (data.src.tagName) {
      // Since `data.src` can be an element, parse out the string if necessary for the hash.
      data = utils.extendDeep({}, data);
      data.src = data.src.src;
    }
    return JSON.stringify(data);
  },

  hashVideo: function (data, videoEl) {
    return calculateVideoCacheHash(data, videoEl);
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

    // If any textures on this material are no longer in use, dispose of them.
    var textureCounts = this.textureCounts;
    Object.keys(material)
      .filter(function (propName) {
        return material[propName] && material[propName].isTexture;
      })
      .forEach(function (mapName) {
        textureCounts[material[mapName].uuid]--;
        if (textureCounts[material[mapName].uuid] <= 0) {
          material[mapName].dispose();
        }
      });
  },

  /**
   * Track textures used by material components, so that they can be safely
   * disposed when no longer in use. Textures must be registered here, and not
   * through registerMaterial(), because textures may not be attached at the
   * time the material is registered.
   *
   * @param {Event} e
   */
  onMaterialTextureLoaded: function (e) {
    if (!this.textureCounts[e.detail.texture.uuid]) {
      this.textureCounts[e.detail.texture.uuid] = 0;
    }
    this.textureCounts[e.detail.texture.uuid]++;
  }
});

/**
 * Calculates consistent hash from a video element using its attributes.
 * If the video element has an ID, use that.
 * Else build a hash that looks like `src:myvideo.mp4;height:200;width:400;`.
 *
 * @param data {object} - Texture data such as repeat.
 * @param videoEl {Element} - Video element.
 * @returns {string}
 */
function calculateVideoCacheHash (data, videoEl) {
  var i;
  var id = videoEl.getAttribute('id');
  var hash;
  var videoAttributes;

  if (id) { return id; }

  // Calculate hash using sorted video attributes.
  hash = '';
  videoAttributes = data || {};
  for (i = 0; i < videoEl.attributes.length; i++) {
    videoAttributes[videoEl.attributes[i].name] = videoEl.attributes[i].value;
  }
  Object.keys(videoAttributes).sort().forEach(function (name) {
    hash += name + ':' + videoAttributes[name] + ';';
  });

  return hash;
}

/**
 * Load image texture.
 *
 * @private
 * @param {string|object} src - An <img> element or url to an image file.
 * @param {object} data - Data to set texture properties like `repeat`.
 * @returns {Promise} Resolves once texture is loaded.
 */
function loadImageTexture (src, data) {
  return new Promise(doLoadImageTexture);

  function doLoadImageTexture (resolve, reject) {
    var isEl = typeof src !== 'string';

    function resolveTexture (texture) {
      setTextureProperties(texture, data);
      texture.needsUpdate = true;
      resolve(texture);
    }

    // Create texture from an element.
    if (isEl) {
      resolveTexture(new THREE.Texture(src));
      return;
    }

    // Request and load texture from src string. THREE will create underlying element.
    // Use THREE.TextureLoader (src, onLoad, onProgress, onError) to load texture.
    TextureLoader.load(
      src,
      resolveTexture,
      function () { /* no-op */ },
      function (xhr) {
        error('`$s` could not be fetched (Error code: %s; Response: %s)', xhr.status,
              xhr.statusText);
      }
    );
  }
}

/**
 * Create video element to be used as a texture.
 *
 * @param {string} src - Url to a video file.
 * @param {number} width - Width of the video.
 * @param {number} height - Height of the video.
 * @returns {Element} Video element.
 */
function createVideoEl (src, width, height) {
  var videoEl = document.createElement('video');
  videoEl.width = width;
  videoEl.height = height;
  // Support inline videos for iOS webviews.
  videoEl.setAttribute('playsinline', '');
  videoEl.setAttribute('webkit-playsinline', '');
  videoEl.autoplay = true;
  videoEl.loop = true;
  videoEl.crossOrigin = 'anonymous';
  videoEl.addEventListener('error', function () {
    warn('`$s` is not a valid video', src);
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
