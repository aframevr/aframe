var ANode = require('./a-node');
var bind = require('../utils/bind');
var debug = require('../utils/debug');
var registerElement = require('./a-register-element').registerElement;
var THREE = require('../lib/three');

var fileLoader = new THREE.XHRLoader();
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
        this.loadedBytes = 0;
        this.percent = 0;
        this.progress = {};
        this.progressInterval = null;
        this.totalBytes = 0;
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
          imgEl = setCrossOrigin(imgEls[i]);
          loaded.push(new Promise(function (resolve, reject) {
            imgEl.onload = resolve;
            imgEl.onerror = reject;
          }));
        }

        // Wait for <audio>s and <video>s.
        mediaEls = this.querySelectorAll('audio, video');
        for (i = 0; i < mediaEls.length; i++) {
          mediaEl = setCrossOrigin(mediaEls[i]);
          loaded.push(mediaElementLoaded(mediaEl));
        }

        // Trigger loaded for scene to start rendering.
        Promise.all(loaded).then(bind(this.load, this));

        // Progress checker.
        this.progressInterval = setInterval(function updateProgress () {
          self.calculateProgressPercent();
          self.emit('progress', {
            percent: self.percent,
            loadedBytes: self.loadedBytes,
            totalBytes: self.totalBytes
          });
        }, 100);

        // Timeout to start loading anyways.
        timeout = parseInt(this.getAttribute('timeout'), 10) || 3000;
        this.timeout = setTimeout(function () {
          clearInterval(self.progressInterval);
          if (self.hasLoaded) { return; }
          warn('Asset loading timed out in ', timeout, 'ms');
          self.emit('timeout');
          self.load();
        }, timeout);
      }
    },

    /**
     * Calculate overall progress as a percentage.
     */
    calculateProgressPercent: {
      value: function () {
        var loaded = 0;
        var total = 0;
        for (var src in this.progress) {
          loaded += this.progress[src].loaded;
          total += this.progress[src].total;
        }
        this.loadedBytes = loaded;
        this.totalBytes = total;
        this.percent = Math.round(loaded * 100 / total);
        return this.percent;
      }
    },

    detachedCallback: {
      value: function () {
        if (this.timeout) { clearTimeout(this.timeout); }
        if (this.progressInterval) { clearInterval(this.progressInterval); }
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
        var assetsEl = this.parentNode;
        var self = this;
        var src = this.getAttribute('src');

        // XHRLoader doesn't send ID through the callback, use the filename instead for ID.
        if (!(src in assetsEl.progress)) {
          assetsEl.progress[src] = {loaded: 0, total: 0};
        }

        fileLoader.load(src, function handleOnLoad (textResponse) {
          THREE.Cache.files[src] = textResponse;
          self.data = textResponse;
          /*
            Workaround for a Chrome bug. If another XHR is sent to the same url before the
            previous one closes, the second request never finishes.
            setTimeout finishes the first request and lets the logic triggered by load open
            subsequent requests. setTimeout can be removed once this bug is fixed:
            https://bugs.chromium.org/p/chromium/issues/detail?id=633696
          */
          setTimeout(function load () { ANode.prototype.load.call(self); });
        }, function handleOnProgress (xhr) {
          var src;
          if (!xhr) { return; }
          src = xhr.currentTarget.responseURL;
          if (!(src in assetsEl.progress)) { assetsEl.progress[src] = {}; }
          assetsEl.progress[src].loaded = xhr.loaded / 1000000;
          assetsEl.progress[src].total = xhr.total / 1000000;
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
 * @returns {Promise|null}
 */
function mediaElementLoaded (el) {
  var assetsEl;
  var autoplay;
  var preload;

  /*
    Video elements need either `autoplay` or `preload` to preload.
    Audio elements need either `autoplay` or `preload` to preload.
    Use of `preload` is recommended. `autoplay` would start playing before scene starts.
    Check for opt-out.
   */
  autoplay = el.hasAttribute('autoplay');
  preload = el.getAttribute('preload');
  if (!(preload === 'auto' || preload === '') && !autoplay) { return; }

  // If media specifies preload, wait until media is completely buffered.
  assetsEl = el.parentNode;
  return new Promise(function (resolve, reject) {
    if (el.readyState === 4) { return resolve(); }  // Already loaded.
    if (el.error) { return reject(); }  // Error.

    el.addEventListener('loadeddata', checkProgress, false);
    el.addEventListener('progress', checkProgress, false);
    el.addEventListener('error', reject, false);

    function checkProgress () {
      var i;
      var secondsBuffered;
      var src;

      src = el.getAttribute('src');
      if (!(src in assetsEl.progress) && !(isNaN(el.duration))) {
        assetsEl.progress[src] = {loaded: 0, total: el.duration};
      }

      // Add up the seconds buffered.
      secondsBuffered = 0;
      for (i = 0; i < el.buffered.length; i++) {
        secondsBuffered += el.buffered.end(i) - el.buffered.start(i);
      }

      // Update loaded progress.
      if (src in assetsEl.progress) {
        assetsEl.progress[src].loaded = secondsBuffered;
      }

      // Compare seconds buffered to media duration.
      if (secondsBuffered >= el.duration) { resolve(); }
    }
  });
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

  warn('Cross-origin element was requested without `crossorigin` set. ' +
       'A-Frame will re-request the asset with `crossorigin` attribute set.', src);
  mediaEl.crossOrigin = 'anonymous';
  newMediaEl = mediaEl.cloneNode(true);
  mediaEl.parentNode.appendChild(newMediaEl);
  mediaEl.parentNode.removeChild(mediaEl);
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
  return domain.split(':')[0];
}
