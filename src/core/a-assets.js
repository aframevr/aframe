var ANode = require('./a-node');
var debug = require('../utils/debug');
var registerElement = require('./a-register-element').registerElement;
var THREE = require('../lib/three');

var xhrLoader = new THREE.XHRLoader();
var warn = debug('core:a-assets:warn');

/**
 * Asset management system. Handles blocking on asset loading.
 */
module.exports = registerElement('a-assets', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.isAssets = true;
      }
    },

    attachedCallback: {
      value: function () {
        var self = this;
        var loaded = [];
        var medias = this.querySelectorAll('audio, video');
        var imgs = this.querySelectorAll('img');
        var timeout = parseInt(this.getAttribute('timeout'), 10) || 3000;
        var i;

        if (!this.parentNode.isScene) {
          throw new Error('<a-assets> must be a child of a <a-scene>.');
        }

        // Wait for <img>s.
        for (i = 0; i < imgs.length; i++) {
          var img = imgs[i];
          loaded.push(new Promise(function (resolve, reject) {
            img.onload = resolve;
            img.onerror = reject;
          }));
        }

        // Wait for <audio>s and <video>s.
        for (i = 0; i < medias.length; i++) {
          loaded.push(mediaElementLoaded(medias[i]));
        }

        // Trigger loaded for scene to start rendering.
        Promise.all(loaded).then(this.load.bind(this));

        setTimeout(function () {
          if (self.hasLoaded) { return; }
          warn('Asset loading timed out in ', timeout, 'ms');
          self.emit('timeout');
          self.load();
        }, timeout);
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
        var src = src = this.getAttribute('src');
        xhrLoader.load(src, function (textResponse) {
          THREE.Cache.files[src] = textResponse;
          self.data = textResponse;
          // Workaround for a Chrome bug.
          // if another XMLHttpRequest is sent to the same url
          // before the previous one closes. The second request never finishes.
          // setTimeout finishes the first request and lets the logic
          // triggered by load open subsequent requests.
          // setTimeout can be removed once the fix for the bug below ships:
          // https://bugs.chromium.org/p/chromium/issues/detail?id=633696&q=component%3ABlink%3ENetwork%3EXHR%20&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified
          setTimeout(function load () { ANode.prototype.load.call(self); });
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
        resolve();
      }
    }
  });
}
