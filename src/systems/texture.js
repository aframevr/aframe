var registerSystem = require('../core/system').registerSystem;
var THREE = require('../lib/three');
var utils = require('../utils/');

var debug = utils.debug;
var error = debug('components:texture:error');
var TextureLoader = new THREE.TextureLoader();
var warn = debug('components:texture:warn');

/**
 * System to facilitate texture caching.
 *
 * @member cache {object} - Texture cache for:
 *   - Images: mapping of JSON.stringified data -> Promise.resolve(THREE.Texture).
 *   - Videos: mapping of videoElement attribute hash -> Promise.resolve(THREE.VideoTexture).
 */
module.exports.System = registerSystem('texture', {
  init: function () {
    this.cache = {};
  },

  clearTextureCache: function () {
    this.cache = {};
  },

  /**
   * Determine whether `src` is a image or video. Then try to load the asset, then call back.
   *
   * @param {string} src - Texture URL.
   * @param {string} data - Relevant texture data used for caching.
   * @param {function} cb - Callback to pass texture to.
   */
  loadTexture: function (src, data, cb) {
    var self = this;
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
  loadImage: function (src, data, cb) {
    var hash = this.hash(data);
    var handleImageTextureLoaded = cb;
    var cache = this.cache;

    // Texture already being loaded or already loaded. Wait on promise.
    if (cache[hash]) {
      cache[hash].then(handleImageTextureLoaded);
      return;
    }

    // Texture not yet being loaded. Start loading it.
    cache[hash] = loadImageTexture(src, data);
    cache[hash].then(handleImageTextureLoaded);
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
    var cache = this.cache;
    var videoEl;
    var videoTextureResult;

    function handleVideoTextureLoaded (result) {
      cb(result.texture, result.videoEl);
    }

    // Video element provided.
    if (typeof src !== 'string') {
      // Check cache before creating texture.
      videoEl = src;
      hash = this.hashVideo(data, videoEl);
      if (cache[hash]) {
        cache[hash].then(handleVideoTextureLoaded);
        return;
      }
      // If not in cache, fix up the attributes then start to create the texture.
      fixVideoAttributes(videoEl);
    }

    // Only URL provided. Use video element to create texture.
    videoEl = videoEl || createVideoEl(src, data.width, data.height);

    // Generated video element already cached. Use that.
    hash = this.hashVideo(data, videoEl);
    if (cache[hash]) {
      cache[hash].then(handleVideoTextureLoaded);
      return;
    }

    // Create new video texture.
    texture = new THREE.VideoTexture(videoEl);
    texture.minFilter = THREE.LinearFilter;
    setTextureProperties(texture, data);

    // Cache as promise to be consistent with image texture caching.
    videoTextureResult = {texture: texture, videoEl: videoEl};
    cache[hash] = Promise.resolve(videoTextureResult);
    handleVideoTextureLoaded(videoTextureResult);
  },

  hash: function (data) {
    return JSON.stringify(data);
  },

  hashVideo: function (data, videoEl) {
    return calculateVideoCacheHash(data, videoEl);
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
      resolve(texture);
    }

    // Create texture from an element.
    if (isEl) {
      resolveTexture(new THREE.Texture(src));
      return;
    }

    // Load texture from src string. THREE will create underlying element.
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
 * Set texture properties such as repeat.
 *
 * @param {object} data - With keys like `repeat`.
 */
function setTextureProperties (texture, data) {
  // Handle UV repeat.
  var repeat = data.repeat || '1 1';
  var repeatXY = repeat.split(' ');

  // Don't bother setting repeat if it is 1/1. Power-of-two is required to repeat.
  if (repeat === '1 1' || repeatXY.length !== 2) { return; }

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(parseInt(repeatXY[0], 10), parseInt(repeatXY[1], 10));
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
  videoEl.setAttribute('webkit-playsinline', '');  // Support inline videos for iOS webviews.
  videoEl.autoplay = true;
  videoEl.loop = true;
  videoEl.crossOrigin = true;
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
  videoEl.autoplay = videoEl.getAttribute('autoplay') !== 'false';
  videoEl.controls = videoEl.getAttribute('controls') !== 'false';
  if (videoEl.getAttribute('loop') === 'false') {
    videoEl.removeAttribute('loop');
  }
  if (videoEl.getAttribute('preload') === 'false') {
    videoEl.preload = 'none';
  }
  videoEl.crossOrigin = true;
  // To support inline videos in iOS webviews.
  videoEl.setAttribute('webkit-playsinline', '');
  return videoEl;
}
