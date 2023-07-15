/* global customElements */
var ANode = require('./a-node').ANode;
var bind = require('../utils/bind');
var debug = require('../utils/debug');
var THREE = require('../lib/three');

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

  connectedCallback () {
    // Defer if DOM is not ready.
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', this.onReadyStateChange.bind(this));
      return;
    }

    this.doConnectedCallback();
  }

  doConnectedCallback () {
    var self = this;
    var i;
    var loaded = [];
    var mediaEl;
    var mediaEls;
    var imgEl;
    var imgEls;
    var timeout;

    super.connectedCallback();

    if (!this.parentNode.isScene) {
      throw new Error('<a-assets> must be a child of a <a-scene>.');
    }

    // Wait for <img>s.
    imgEls = this.querySelectorAll('img');
    for (i = 0; i < imgEls.length; i++) {
      imgEl = fixUpMediaElement(imgEls[i]);
      loaded.push(new Promise(function (resolve, reject) {
        // Set in cache because we won't be needing to call three.js loader if we have.
        // a loaded media element.
        THREE.Cache.add(imgEls[i].getAttribute('src'), imgEl);
        if (imgEl.complete) {
          resolve();
          return;
        }
        imgEl.onload = resolve;
        imgEl.onerror = reject;
      }));
    }

    // Wait for <audio>s and <video>s.
    mediaEls = this.querySelectorAll('audio, video');
    for (i = 0; i < mediaEls.length; i++) {
      mediaEl = fixUpMediaElement(mediaEls[i]);
      if (!mediaEl.src && !mediaEl.srcObject) {
        warn('Audio/video asset has neither `src` nor `srcObject` attributes.');
      }
      loaded.push(mediaElementLoaded(mediaEl));
    }

    // Trigger loaded for scene to start rendering.
    Promise.allSettled(loaded).then(bind(this.load, this));

    // Timeout to start loading anyways.
    timeout = parseInt(this.getAttribute('timeout'), 10) || 3000;
    this.timeout = setTimeout(function () {
      if (self.hasLoaded) { return; }
      warn('Asset loading timed out in ', timeout, 'ms');
      self.emit('timeout');
      self.load();
    }, timeout);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    if (this.timeout) { clearTimeout(this.timeout); }
  }

  load () {
    super.load.call(this, null, function waitOnFilter (el) {
      return el.isAssetItem && el.hasAttribute('src');
    });
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
      self.emit('error', {xhr: xhr});
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
function inferResponseType (src) {
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
module.exports.inferResponseType = inferResponseType;

/**
 * Extract filename from URL
 *
 * @param {string} url
 * @returns {string}
 */
function getFileNameFromURL (url) {
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.replace(/^\?/, '');
  var filePath = url.replace(query, '').replace('?', '');
  return filePath.substring(filePath.lastIndexOf('/') + 1);
}
module.exports.getFileNameFromURL = getFileNameFromURL;
