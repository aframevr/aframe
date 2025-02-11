/* global customElements */
import THREE from '../lib/three.js';
import { ANode } from './a-node.js';
import { debug } from '../utils/index.js';

var fileLoader = new THREE.FileLoader();
var warn = debug('core:a-assets:warn');

/**
 * Asset management system. Handles blocking on asset loading.
 */
class AAssets extends ANode {
  constructor () {
    super();
    this.isAssets = true;
    this.fileLoader = fileLoader;
    this.timeout = null;
  }

  doConnectedCallback () {
    var self = this;
    
    setTimeout(() => self.load(), 500);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    if (this.timeout) { clearTimeout(this.timeout); }
  }

  load () {
    // Filter out all children, as waiting already took place in doConnectedCallback.
    super.load.call(this, null, function () { return false; });
  }
}

customElements.define('a-assets', AAssets);

/**
 * Preload using XHRLoader for any type of asset.
 */
class AAssetItem extends ANode {
  constructor () {
    super();
    this.data = null;
    this.isAssetItem = true;
  }

  connectedCallback () {
    var self = this;
    var src = this.getAttribute('src');
    fileLoader.setResponseType(
      this.getAttribute('response-type') || inferResponseType(src));
    fileLoader.load(src, function handleOnLoad (response) {
      self.data = response;
      ANode.prototype.load.call(self);
    }, function handleOnProgress (xhr) {
      self.emit('progress', {
        loadedBytes: xhr.loaded,
        totalBytes: xhr.total,
        xhr: xhr
      });
    }, function handleOnError (xhr) {
      self.emit('error', {xhr: xhr}, false);
    });
  }
}

customElements.define('a-asset-item', AAssetItem);

/**
 * Create a Promise that resolves once the media element has finished buffering.
 *
 * @param {Element} el - HTMLMediaElement.
 * @returns {Promise}
 */
function mediaElementLoaded (el) {
  if (!el.hasAttribute('autoplay') && el.getAttribute('preload') !== 'auto') {
    return;
  }

  // If media specifies autoplay or preload, wait until media is completely buffered.
  return new Promise(function (resolve, reject) {
    if (el.readyState === 4) { return resolve(); }  // Already loaded.
    if (el.error) { return reject(); }  // Error.

    el.addEventListener('loadeddata', checkProgress, false);
    el.addEventListener('progress', checkProgress, false);
    el.addEventListener('error', reject, false);

    function checkProgress () {
      // Add up the seconds buffered.
      var secondsBuffered = 0;
      for (var i = 0; i < el.buffered.length; i++) {
        secondsBuffered += el.buffered.end(i) - el.buffered.start(i);
      }

      // Compare seconds buffered to media duration.
      if (secondsBuffered >= el.duration) {
        // Set in cache because we won't be needing to call three.js loader if we have.
        // a loaded media element.
        // Store video elements only. three.js loader is used for audio elements.
        // See assetParse too.
        if (el.tagName === 'VIDEO') {
          THREE.Cache.add(el.getAttribute('src'), el);
        }
        resolve();
      }
    }
  });
}

/**
 * Automatically add attributes to media elements where convenient.
 * crossorigin, playsinline.
 */
function fixUpMediaElement (mediaEl) {
  // Cross-origin.
  var newMediaEl = setCrossOrigin(mediaEl);

  // Plays inline for mobile.
  if (newMediaEl.tagName && newMediaEl.tagName.toLowerCase() === 'video') {
    newMediaEl.setAttribute('playsinline', '');
    newMediaEl.setAttribute('webkit-playsinline', '');
  }

  if (newMediaEl !== mediaEl) {
    mediaEl.parentNode.appendChild(newMediaEl);
    mediaEl.parentNode.removeChild(mediaEl);
  }
  return newMediaEl;
}

/**
 * Automatically set `crossorigin` if not defined on the media element.
 * If it is not defined, we must create and re-append a new media element <img> and
 * have the browser re-request it with `crossorigin` set.
 *
 * @param {Element} Media element (e.g., <img>, <audio>, <video>).
 * @returns {Element} Media element to be used to listen to for loaded events.
 */
function setCrossOrigin (mediaEl) {
  var newMediaEl;
  var src;

  // Already has crossorigin set.
  if (mediaEl.hasAttribute('crossorigin')) { return mediaEl; }

  src = mediaEl.getAttribute('src');

  if (src !== null) {
    // Does not have protocol.
    if (src.indexOf('://') === -1) { return mediaEl; }

    // Determine if cross origin is actually needed.
    if (extractDomain(src) === window.location.host) { return mediaEl; }
  }

  warn('Cross-origin element (e.g., <img>) was requested without `crossorigin` set. ' +
       'A-Frame will re-request the asset with `crossorigin` attribute set. ' +
       'Please set `crossorigin` on the element (e.g., <img crossorigin="anonymous">)', src);
  mediaEl.crossOrigin = 'anonymous';
  newMediaEl = mediaEl.cloneNode(true);
  return newMediaEl;
}

/**
 * Extract domain out of URL.
 *
 * @param {string} url
 * @returns {string}
 */
function extractDomain (url) {
  // Find and remove protocol (e.g., http, ftp, etc.) to get domain.
  var domain = url.indexOf('://') > -1 ? url.split('/')[2] : url.split('/')[0];

  // Find and remove port number.
  return domain.substring(0, domain.indexOf(':'));
}

/**
 * Infer response-type attribute from src.
 * Default is text (default XMLHttpRequest.responseType)
 * and arraybuffer for .glb files.
 *
 * @param {string} src
 * @returns {string}
 */
export function inferResponseType (src) {
  var fileName = getFileNameFromURL(src);
  var dotLastIndex = fileName.lastIndexOf('.');
  if (dotLastIndex >= 0) {
    var extension = fileName.slice(dotLastIndex, src.search(/\?|#|$/));
    if (extension === '.glb') {
      return 'arraybuffer';
    }
  }
  return 'text';
}

/**
 * Extract filename from URL
 *
 * @param {string} url
 * @returns {string}
 */
export function getFileNameFromURL (url) {
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.replace(/^\?/, '');
  var filePath = url.replace(query, '').replace('?', '');
  return filePath.substring(filePath.lastIndexOf('/') + 1);
}
