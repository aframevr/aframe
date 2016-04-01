var registerSystem = require('../core/system').registerSystem;
var THREE = require('../lib/three');
var utils = require('../utils/');

var EVENTS = {
  TEXTURE_LOADED: 'material-texture-loaded'
};
var debug = utils.debug;
var error = debug('components:texture:error');
var TextureLoader = new THREE.TextureLoader();
var warn = debug('components:texture:warn');

/**
 * System for material component.
 * Handle material registration, updates (for fog), and texture caching.
 *
 * @member materials {object} - Registered materials.
 * @member textureCache {object} - Texture cache for:
 *   - Images: textureCache has mapping of src -> repeat -> cached three.js texture.
 *   - Videos: textureCache has mapping of videoElement -> cached three.js texture.
 */
module.exports.System = registerSystem('material', {
  init: function () {
    this.materials = {};
    this.textureCache = {};
  },

  clearTextureCache: function () {
    this.textureCache = {};
  },

  /**
   * High-level function for loading image textures. Meat of logic is in `loadImageTexture`.
   *
   * @param {Element} el - Entity, used to emit event.
   * @param {object} material - three.js material, bound by the A-Frame shader.
   * @param {object} data - Shader data, bound by the A-Frame shader.
   * @param {Element|string} src - Texture source, bound by `src-loader` utils.
   */
  loadImage: function (el, material, data, src) {
    var repeat = data.repeat || '1 1';
    var srcString = src;
    var textureCache = this.textureCache;

    if (typeof src !== 'string') { srcString = src.getAttribute('src'); }

    // Another material is already loading this texture. Wait on promise.
    if (textureCache[src] && textureCache[src][repeat]) {
      textureCache[src][repeat].then(handleImageTextureLoaded);
      return;
    }

    // Material instance is first to try to load this texture. Load it.
    textureCache[srcString] = textureCache[srcString] || {};
    textureCache[srcString][repeat] = textureCache[srcString][repeat] || {};
    textureCache[srcString][repeat] = loadImageTexture(material, src, repeat);
    textureCache[srcString][repeat].then(handleImageTextureLoaded);

    function handleImageTextureLoaded (texture) {
      utils.material.updateMaterialTexture(material, texture);
      el.emit(EVENTS.TEXTURE_LOADED, { src: src, texture: texture });
    }
  },

  /**
   * Load video texture.
   * Note that creating a video texture is more synchronous than creating an image texture.
   *
   * @param {Element} el - Entity, used to emit event.
   * @param {object} material - three.js material.
   * @param data {object} - Shader data, bound by the A-Frame shader.
   * @param src {Element|string} - Texture source, bound by `src-loader` utils.
   */
  loadVideo: function (el, material, data, src) {
    var hash;
    var texture;
    var textureCache = this.textureCache;
    var videoEl;
    var videoTextureResult;

    if (typeof src !== 'string') {
      // Check cache before creating texture.
      videoEl = src;
      hash = calculateVideoCacheHash(videoEl);
      if (textureCache[hash]) {
        textureCache[hash].then(handleVideoTextureLoaded);
        return;
      }
      // If not in cache, fix up the attributes then start to create the texture.
      fixVideoAttributes(videoEl);
    }

    // Use video element to create texture.
    videoEl = videoEl || createVideoEl(material, src, data.width, data.height);

    // Generated video element already cached. Use that.
    hash = calculateVideoCacheHash(videoEl);
    if (textureCache[hash]) {
      textureCache[hash].then(handleVideoTextureLoaded);
      return;
    }

    // Create new video texture.
    texture = new THREE.VideoTexture(videoEl);
    texture.minFilter = THREE.LinearFilter;

    // Cache as promise to be consistent with image texture caching.
    videoTextureResult = {
      texture: texture,
      videoEl: videoEl
    };
    textureCache[hash] = Promise.resolve(videoTextureResult);
    handleVideoTextureLoaded(videoTextureResult);

    function handleVideoTextureLoaded (res) {
      texture = res.texture;
      videoEl = res.videoEl;
      utils.material.updateMaterialTexture(material, texture);
      el.emit(EVENTS.TEXTURE_LOADED, { element: videoEl, src: src });
      videoEl.addEventListener('loadeddata', function () {
        el.emit('material-video-loadeddata', { element: videoEl, src: src });
      });
      videoEl.addEventListener('ended', function () {
        // Works for non-looping videos only.
        el.emit('material-video-ended', { element: videoEl, src: src });
      });
    }
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
   * Stop tracking material.
   *
   * @param {object} material
   */
  unregisterMaterial: function (material) {
    delete this.materials[material.uuid];
  },

  /**
   * Trigger update to all registered materials.
   */
  updateMaterials: function (material) {
    var materials = this.materials;
    Object.keys(materials).forEach(function (uuid) {
      materials[uuid].needsUpdate = true;
    });
  }
});

/**
 * Calculates consistent hash from a video element using its attributes.
 * If the video element has an ID, use that.
 * Else build a hash that looks like `src:myvideo.mp4;height:200;width:400;`.
 *
 * @param videoEl {Element} - Video element.
 * @returns {string}
 */
function calculateVideoCacheHash (videoEl) {
  var i;
  var id = videoEl.getAttribute('id');
  var hash;
  var videoAttributes;

  if (id) { return id; }

  // Calculate hash using sorted video attributes.
  hash = '';
  videoAttributes = {};
  for (i = 0; i < videoEl.attributes.length; i++) {
    videoAttributes[videoEl.attributes[i].name] = videoEl.attributes[i].value;
  }
  Object.keys(videoAttributes).sort().forEach(function (name) {
    hash += name + ':' + videoAttributes[name] + ';';
  });

  return hash;
}

/**
 * Set image texture on material as `map`.
 *
 * @private
 * @param {object} el - Entity element.
 * @param {object} material - three.js material.
 * @param {string|object} src - An <img> element or url to an image file.
 * @param {string} repeat - X and Y value for size of texture repeating (in UV units).
 * @returns {Promise} Resolves once texture is loaded.
 */
function loadImageTexture (material, src, repeat) {
  return new Promise(doLoadImageTexture);

  function doLoadImageTexture (resolve, reject) {
    var isEl = typeof src !== 'string';

    // Create texture from an element.
    if (isEl) {
      createTexture(src);
      return;
    }

    // Load texture from src string. THREE will create underlying element.
    // Use THREE.TextureLoader (src, onLoad, onProgress, onError) to load texture.
    TextureLoader.load(
      src,
      createTexture,
      function () { /* no-op */ },
      function (xhr) {
        error('`$s` could not be fetched (Error code: %s; Response: %s)', xhr.status,
              xhr.statusText);
      }
    );

    /**
     * Texture loaded. Set it.
     */
    function createTexture (texture) {
      var repeatXY;
      if (!(texture instanceof THREE.Texture)) { texture = new THREE.Texture(texture); }

      // Handle UV repeat.
      repeatXY = repeat.split(' ');
      if (repeatXY.length === 2) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(parseInt(repeatXY[0], 10), parseInt(repeatXY[1], 10));
      }

      resolve(texture);
    }
  }
}

/**
 * Create video element to be used as a texture.
 *
 * @param {object} material - three.js material.
 * @param {string} src - Url to a video file.
 * @param {number} width - Width of the video.
 * @param {number} height - Height of the video.
 * @returns {Element} Video element.
 */
function createVideoEl (material, src, width, height) {
  var el = material.videoEl || document.createElement('video');
  el.width = width;
  el.height = height;
  if (el !== this.videoEl) {
    el.setAttribute('webkit-playsinline', '');  // To support inline videos in iOS webviews.
    el.autoplay = true;
    el.loop = true;
    el.crossOrigin = true;
    el.addEventListener('error', function () {
      warn('`$s` is not a valid video', src);
    }, true);
    material.videoEl = el;
  }
  el.src = src;
  return el;
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
