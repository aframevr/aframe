/**
 * Texture helpers for standard material component.
 *
 * @member textureCache {object} - Texture cache for:
 *   - Images: textureCache has mapping of src -> repeat -> cached three.js texture.
 *   - Videos: textureCache has mapping of videoElement -> cached three.js texture.
 * @member videoCache {object} - Cache of video elements.
 */
var debug = require('./debug');
var THREE = require('../lib/three');

var EVENTS = {
  TEXTURE_LOADED: 'material-texture-loaded'
};
var error = debug('components:texture:error');
var textureCache = {};
var TextureLoader = new THREE.TextureLoader();
var warn = debug('components:texture:warn');

/**
 * High-level function for loading image textures. Meat of logic is in `loadImageTexture`.
 * Bound to material component instance and three.js material.
 *
 * @param material {object} - three.js material, bound by the A-Frame shader.
 * @param data {object} - Shader data, bound by the A-Frame shader.
 * @param src {Element|string} - Texture source, bound by `src-loader` utils.
 */
function loadImage (material, data, src) {
  var el = this.el;
  var repeat = data.repeat || '1 1';
  var srcString = src;

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
    updateMaterial(material, texture);
    el.emit(EVENTS.TEXTURE_LOADED, { src: src, texture: texture });
  }
}

/**
 * Load video texture.
 * Bound to material component instance and three.js material.
 * Note that creating a video texture is more synchronous than creating an image texture.
 *
 * @param material {object} - three.js material, bound by the A-Frame shader.
 * @param data {object} - Shader data, bound by the A-Frame shader.
 * @param src {Element|string} - Texture source, bound by `src-loader` utils.
 */
function loadVideo (material, data, src) {
  var el = this.el;
  var hash;
  var texture;
  var videoEl;

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
  textureCache[calculateVideoCacheHash(videoEl)] = Promise.resolve(texture, videoEl);
  handleVideoTextureLoaded(texture, videoEl);

  function handleVideoTextureLoaded (texture, videoEl) {
    updateMaterial(material, texture);
    el.emit(EVENTS.TEXTURE_LOADED, { element: videoEl, src: src });
    videoEl.addEventListener('loadeddata', function () {
      el.emit('material-video-loadeddata', { element: videoEl, src: src });
    });
    videoEl.addEventListener('ended', function () {
      // Works for non-looping videos only.
      el.emit('material-video-ended', { element: videoEl, src: src });
    });
  }
}

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
 * Set material texture and update if necessary.
 *
 * @param {object} material
 * @param {object} texture
 */
function updateMaterial (material, texture) {
  var oldMap = material.map;
  if (texture) { texture.needsUpdate = true; }
  material.map = texture;

  // Only need to update three.js material if presence or not of texture has changed.
  if (oldMap === null && material.map || material.map === null && oldMap) {
    material.needsUpdate = true;
  }
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
  if (!videoEl.hasAttribute('crossorigin')) {
    videoEl.crossOrigin = true;
  }
  if (!videoEl.hasAttribute('webkit-playsinline')) {
    videoEl.setAttribute('webkit-playsinline', '');  // To support inline videos in iOS webviews.
  }
  return videoEl;
}

function clearTextureCache () {
  textureCache = {};
}

module.exports = {
  clearTextureCache: clearTextureCache,
  createVideoEl: createVideoEl,
  fixVideoAttributes: fixVideoAttributes,
  loadImage: loadImage,
  loadVideo: loadVideo,
  textureCache: textureCache,
  updateMaterial: updateMaterial
};
