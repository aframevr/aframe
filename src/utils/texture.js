var debug = require('./debug');
var error = debug('components:texture:error');
var THREE = require('../lib/three');
var TextureLoader = new THREE.TextureLoader();
var warn = debug('components:texture:warn');

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
    texture.needsUpdate = true;
    updateMaterial(material, texture);
  }
}

/**
 * Updates material texture
 * @param  {object} material [description]
 * @param  {object} texture  [description]
 */
function updateMaterial (material, texture) {
  if (material.map !== undefined) {
    if (texture) { texture.needsUpdate = true; }
    material.map = texture;
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
  updateMaterial(material, texture);
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

module.exports = {
  createVideoEl: createVideoEl,
  fixVideoAttributes: fixVideoAttributes,
  loadImageTexture: loadImageTexture,
  loadVideoTexture: loadVideoTexture,
  updateMaterial: updateMaterial
};
