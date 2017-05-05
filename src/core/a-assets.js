/* global XMLHttpRequest, URL */
var ANode = require('./a-node');
var bind = require('../utils/bind');
var debug = require('../utils/debug');
var registerElement = require('./a-register-element').registerElement;
var THREE = require('../lib/three');

var fileLoader = new THREE.FileLoader();
var warn = debug('core:a-assets:warn');

/**
 * Asset management system. Handles blocking on asset loading.
 */
module.exports = registerElement('a-assets', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.isAssets = true;
        this.fileLoader = fileLoader;
        this.timeout = null;
      }
    },

    attachedCallback: {
      value: function () {
        var self = this;
        var i;
        var loaded = [];
        var mediaEl;
        var mediaEls;
        var imgEl;
        var imgEls;
        var timeout;

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
            THREE.Cache.files[imgEls[i].getAttribute('src')] = imgEl;
            imgEl.onload = resolve;
            imgEl.onerror = reject;
          }));
        }

        // Wait for <audio>s and <video>s.
        mediaEls = this.querySelectorAll('audio, video');
        for (i = 0; i < mediaEls.length; i++) {
          mediaEl = fixUpMediaElement(mediaEls[i]);
          loaded.push(mediaElementLoaded(mediaEl));
        }

        // Trigger loaded for scene to start rendering.
        Promise.all(loaded).then(bind(this.load, this));

        // Timeout to start loading anyway.
        timeout = parseInt(this.getAttribute('timeout'), 10) || 3000;
        this.timeout = setTimeout(function () {
          if (self.hasLoaded) { return; }
          warn('Asset loading timed out in ', timeout, 'ms');
          self.emit('timeout');
          self.load();
        }, timeout);
      }
    },

    detachedCallback: {
      value: function () {
        if (this.timeout) { clearTimeout(this.timeout); }
      }
    },

    load: {
      value: function () {
        ANode.prototype.load.call(this, null, function waitOnFilter (el) {
          return el.isAssetItem && el.hasAttribute('src');
        });
      }
    }
  })
});

/**
 * Preload using XHRLoader for any type of asset.
 */
registerElement('a-asset-item', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.data = null;
        this.isAssetItem = true;
      }
    },

    attachedCallback: {
      value: function () {
        var self = this;
        var src = this.getAttribute('src');
        fileLoader.setResponseType(
          this.getAttribute('response-type') || inferResponseType(src));
        fileLoader.load(src, function handleOnLoad (response) {
          self.data = response;
          /*
            Workaround for a Chrome bug. If another XHR is sent to the same URL before the
            previous one closes, the second request never finishes.
            setTimeout finishes the first request and lets the logic triggered by load open
            subsequent requests.
            setTimeout can be removed once the fix for the bug below ships:
            https://crbug.com/633696
          */
          setTimeout(function load () { ANode.prototype.load.call(self); });
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
  })
});

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

    // Respect WebKit's user-gesture requirement for auto-playback of
    // video containing audio. For more info:
    // https://webkit.org/blog/6784/new-video-policies-for-ios/
    window.addEventListener('click', handleFirstClick);
    function handleFirstClick () {
      try {
        if (el.paused) {
          el.play();
        }
      } catch (e) {
      }
      window.removeEventListener('click', handleFirstClick);
    }

    // Workaround for WebKit bug when loading cross-origin videos:
    // https://bugs.webkit.org/show_bug.cgi?id=135379
    //
    // Adapted from this fantastic source:
    // https://blog.madj.me/safari-ios-problems-when-drawing-video/
    if (/iP(hone|od|ad)/.test(navigator.platform) &&
        'URL' in window &&
        window.location.origin !== new URL(el.src).origin) {
      // Check if you are on iOS or Safari < 10.
      if (/iP(hone|od|ad)/.test(navigator.platform)) {
        var video = document.createElement('video');
        var srcVideo = el.getAttribute('src');
        var srcBlob = '';
        var onCanPlay = function () {
          video.removeEventListener('canplay', onCanPlay);
          window.addEventListener('beforeunload', function () {
            URL.revokeObjectURL(srcBlob);
          });
          el.setAttribute('src', srcBlob);
          // We can now bind the video texture with the WebGL context.
          next();
        };

        var xhr = new XMLHttpRequest();
        xhr.open('get', srcVideo, true);
        xhr.responseType = 'blob';
        xhr.addEventListener('load', function () {
          var blob = xhr.response;

          video.addEventListener('canplay', onCanPlay);

          // Create a URL for the blob we just received.
          video.src = srcBlob = URL.createObjectURL(blob);

          onCanPlay();
        });
        xhr.send();
      }
    } else {
      next();
    }

    function next () {
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
          THREE.Cache.files[el.getAttribute('src')] = el;
          resolve();
        }
      }
    }
  });
}

/**
 * Automatically add attributes to media elements when needed:
 * crossorigin, playsinline.
 */
function fixUpMediaElement (mediaEl) {
  // Cross-origin.
  var newMediaEl = setCrossOrigin(mediaEl);

  // Plays inline on iOS mobile.
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
 * Extract domain (without port) out of URL.
 *
 * @param {string} url
 * @returns {string}
 */
function extractDomain (url) {
  if ('URL' in window) {
    return new URL(url).host;
  }

  var a = document.createElement('a');
  a.href = url;
  return a.host;
}

/**
 * Infer response-type attribute from src.
 * Default is text (default XMLHttpRequest.responseType),
 * but we use arraybuffer for .gltf and .glb files
 * because of THREE.GLTFLoader specification.
 *
 * @param {string} src
 * @returns {string}
 */
function inferResponseType (src) {
  var dotLastIndex = src.lastIndexOf('.');
  if (dotLastIndex >= 0) {
    var extension = src.slice(dotLastIndex, src.length);
    if (extension === '.gltf' || extension === '.glb') {
      return 'arraybuffer';
    }
  }
  return 'text';
}
module.exports.inferResponseType = inferResponseType;
