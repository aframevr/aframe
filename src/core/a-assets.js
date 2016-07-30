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
        var audios = this.querySelectorAll('audio');
        var imgs = this.querySelectorAll('img');
        var timeout = parseInt(this.getAttribute('timeout'), 10) || 3000;
        var videos = this.querySelectorAll('video');

        if (!this.parentNode.isScene) {
          throw new Error('<a-assets> must be a child of a <a-scene>.');
        }

        // Wait for <img>s.
        for (var i = 0; i < imgs.length; i++) {
          loaded.push(new Promise(function (resolve, reject) {
            var img = imgs[i];
            img.onload = resolve;
            img.onerror = reject;
          }));
        }

        // Wait for <audio>s.
        for (i = 0; i < audios.length; i++) {
          loaded.push(mediaElementLoaded(audios[i]));
        }

        // Wait for <video>s.
        for (i = 0; i < videos.length; i++) {
          loaded.push(mediaElementLoaded(videos[i]));
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
        var src = this.getAttribute('src');

        xhrLoader.load(src, function (textResponse) {
          self.data = textResponse;
          ANode.prototype.load.call(self);
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
