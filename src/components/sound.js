var registerComponent = require('../core/component').registerComponent;
var debug = require('../utils/debug');
var bind = require('../utils/bind');
var THREE = require('../lib/three');

var warn = debug('components:sound:warn');

/**
 * Sound component.
 */
module.exports.Component = registerComponent('sound', {
  schema: {
    autoplay: {default: false},
    loop: {default: false},
    on: {default: ''},
    poolSize: {default: 1},
    src: {type: 'audio'},
    volume: {default: 1}
  },

  multiple: true,

  init: function () {
    this.listener = null;
    this.audioLoader = new THREE.AudioLoader();
    this.pool = new THREE.Group();
    this.playSound = bind(this.playSound, this);
  },

  update: function (oldData) {
    var data = this.data;
    var srcChanged = data.src !== oldData.src;
    // Create new sound if not yet created or changing `src`.
    if (srcChanged) {
      if (!data.src) {
        warn('Audio source was not specified with `src`');
        return;
      }
      this.setupSound();
    }

    this.pool.children.forEach(function (sound) {
      sound.autoplay = data.autoplay;
      sound.setLoop(data.loop);
      sound.setVolume(data.volume);
    });

    if (data.on !== oldData.on) {
      this.updateEventListener(oldData.on);
    }

    // All sound values set. Load in `src`.
    if (srcChanged) {
      var self = this;
      this.audioLoader.load(data.src, function (buffer) {
        self.pool.children.forEach(function (sound) {
          sound.setBuffer(buffer);
        });
        // Remove this key from cache, otherwise we can't play it again
        THREE.Cache.remove(data.src);
      });
    }
  },

  pause: function () {
    this.pauseSound();
    this.removeEventListener();
  },

  play: function () {
    if (this.data.autoplay) { this.playSound(); }
    this.updateEventListener();
  },

  remove: function () {
    this.removeEventListener();
    this.el.removeObject3D(this.attrName);
    try {
      this.pool.children.forEach(function (sound) {
        sound.disconnect();
      });
    } catch (e) {
      // disconnect() will throw if it was never connected initially.
      warn('Audio source not properly disconnected');
    }
  },

  /**
  *  Update listener attached to the user defined on event.
  */
  updateEventListener: function (oldEvt) {
    var el = this.el;
    if (oldEvt) { el.removeEventListener(oldEvt, this.playSound); }
    el.addEventListener(this.data.on, this.playSound);
  },

  removeEventListener: function () {
    this.el.removeEventListener(this.data.on, this.playSound);
  },

  /**
   * Removes current sound object, creates new sound object, adds to entity.
   *
   * @returns {object} sound
   */
  setupSound: function () {
    var el = this.el;
    var sceneEl = el.sceneEl;

    if (this.pool.children.length > 0) {
      this.stopSound();
      el.removeObject3D('sound');
    }

    // Only want one AudioListener. Cache it on the scene.
    var listener = this.listener = sceneEl.audioListener || new THREE.AudioListener();
    sceneEl.audioListener = listener;

    if (sceneEl.camera) {
      sceneEl.camera.add(listener);
    }

    // Wait for camera if necessary.
    sceneEl.addEventListener('camera-set-active', function (evt) {
      evt.detail.cameraEl.getObject3D('camera').add(listener);
    });

    // Create [poolSize] audio instances and attach them to pool
    this.pool = new THREE.Group();
    for (var i = 0; i < this.data.poolSize; i++) {
      var sound = new THREE.PositionalAudio(listener);
      this.pool.add(sound);
    }
    el.setObject3D(this.attrName, this.pool);

    this.pool.children.forEach(function (sound) {
      sound.onEnded = function () {
        sound.isPlaying = false;
        el.emit('sound-ended', {index: i});
      };
    });
  },

  /**
   * Pause all the sounds in the pool.
   */
  pauseSound: function () {
    this.pool.children.forEach(function (sound) {
      if (!sound.source || !sound.source.buffer || !sound.isPlaying || !sound.pause) { return; }
      sound.pause();
    });
  },

  /**
   * Look for an unused sound in the pool and play it if found.
   */
  playSound: function () {
    var found = false;
    this.pool.children.forEach(function (sound) {
      if (!sound.isPlaying && sound.buffer && !found) {
        sound.play();
        found = true;
        return;
      }
    });

    if (!found) {
      warn('All the sounds are playing. If you need to play more sounds simultaneously ' +
           'consider increasing the size of pool with the `poolSize` attribute.');
    }
  },

  /**
   * Stop all the sounds in the pool.
   */
  stopSound: function () {
    this.pool.children.forEach(function (sound) {
      if (!sound.source || !sound.source.buffer) { return; }
      sound.stop();
    });
  }
});
