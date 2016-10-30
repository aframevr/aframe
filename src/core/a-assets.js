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
        this.loadedData = 0;
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

        // Timeout to start loading anyways.
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

// Lets create the object that will hold asset's loaded/total info.
var assetsElement = {};
function assetsProgress () {
  var assetsLoaded = 0;
  var assetsTotal = 0;
  var mediaPercent = 0;
  for (var key in assetsElement) {
    assetsLoaded += assetsElement[key].loaded;
    assetsTotal += assetsElement[key].total;
  }
  if (assetsTotal > 0) {
    mediaPercent = Math.round((assetsLoaded * 100) / assetsTotal);
  }
  return mediaPercent;
}

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
        // Since the XHRLoader doesn't send an id through the callback
        // We'll use the file name as an id
        var file = (src).split('/').pop().replace('.', '-');
        if (!(file in assetsElement)) { assetsElement[file] = {'id': file, 'loaded': 0, 'total': 0}; }
        fileLoader.load(src, function handleOnLoad (textResponse) {
          THREE.Cache.files[src] = textResponse;
          self.data = textResponse;
          /*
            Workaround for a Chrome bug. If another XHR is sent to the same url before the
            previous one closes, the second request never finishes.
            setTimeout finishes the first request and lets the logic triggered by load open
            subsequent requests.
            setTimeout can be removed once the fix for the bug below ships:
            https://bugs.chromium.org/p/chromium/issues/detail?id=633696&q=component%3ABlink%3ENetwork%3EXHR%20&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified
          */
          setTimeout(function load () { ANode.prototype.load.call(self); });
        }, function handleOnProgress (xhr) {
          if (xhr != null) {
            var file = (xhr.currentTarget.responseURL).split('/').pop().replace('.', '-');
            assetsElement[file].loaded = xhr.loaded / 1000000;
            assetsElement[file].total = xhr.total / 1000000;
            // mediaElement updated, trigger assetsProgress()
            // add value to our newly accesible property loadedData
            self.parentNode.loadedData = assetsProgress();
            // Finally, lets trigger an emit to <a-assets> to make the value accessible.
            self.emit('progress', {
              loadedBytes: xhr.loaded,
              totalBytes: xhr.total,
              xhr: xhr
            });
          }
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
  // Instead of checking for autoplay + preload="auto" combination
  // have 3 options for preload: buffer, full, none
  // buffer: works in combination with autoplay (your typical stream).
  // full: waits untill all media assets have fully buffered.
  // none: gets us out with a return.
  // ** unfortunately, video preloads without the need of autoplay,
  // ** audio files don't begin preloading unless autoplay is defined
  // ** For now, I'm doing preload="none" for audios
  if (el.getAttribute('preload') === 'none' || !el.hasAttribute('preload')) {
    return;
  }
  // If media specifies preload, wait until media is completely buffered.
  return new Promise(function (resolve, reject) {
    if (el.readyState === 4) { return resolve(); }  // Already loaded.
    if (el.error) { return reject(); }  // Error.

    el.addEventListener('loadeddata', checkProgress, false);
    el.addEventListener('progress', checkProgress, false);
    el.addEventListener('error', reject, false);

    function checkProgress () {
      // add new mediaElement to assetsElement object
      // check that the mediaElement with isNaN(el.duration)
      // use file name as object key
      var file = (el.src).split('/').pop().replace('.', '-');
      if (!(file in assetsElement) && !(isNaN(el.duration))) { assetsElement[file] = {'id': file, 'loaded': 0, 'total': el.duration}; }
      // Add up the seconds buffered.
      var secondsBuffered = 0;
      for (var i = 0; i < el.buffered.length; i++) {
        secondsBuffered += el.buffered.end(i) - el.buffered.start(i);
      }
      // Time to update the value of "loaded" to this mediaElement.
      if (file in assetsElement) { assetsElement[file].loaded = secondsBuffered; }
      // mediaElement updated, trigger assetsProgress()
      // add value to our newly accesible property loadedData
      el.parentNode.loadedData = assetsProgress();
      // Finally, lets trigger an emit to <a-assets> to make the value accessible.
      el.parentNode.emit('progress', {'progress': el.parentNode.loadedData});
      // Compare seconds buffered to media duration.
      if (secondsBuffered >= el.duration) {
        resolve();
      }
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
