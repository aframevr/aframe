var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var warn = debug('components:sound:warn');

/**
 * Sound component.
 */
module.exports.Component = registerComponent('sound', {
  schema: {
    src: { type: 'src' },
    on: { default: '' },
    autoplay: { default: false },
    loop: { default: false },
    volume: { default: 1 }
  },

  multiple: true,

  init: function () {
    this.listener = null;
    this.audioLoader = new THREE.AudioLoader();
    this.sound = null;
    this.playSound = this.playSound.bind(this);
  },

  update: function (oldData) {
    var data = this.data;
    var sound = this.sound;
    var srcChanged = data.src !== oldData.src;
    // Create new sound if not yet created or changing `src`.
    if (srcChanged) {
      if (!data.src) {
        warn('Audio source was not specified with `src`');
        return;
      }
      sound = this.setupSound();
    }

    sound.autoplay = data.autoplay;
    sound.setLoop(data.loop);
    sound.setVolume(data.volume);

    if (data.on !== oldData.on) {
      this.updateEventListener(oldData.on);
    }

    // All sound values set. Load in `src`.
    if (srcChanged) {
      this.audioLoader.load(data.src, function (buffer) {
        sound.setBuffer(buffer);
        // Remove this key from cache, otherwise we can't play it again
        THREE.Cache.remove(data.src);
      });
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

  remove: function () {
    this.removeEventListener();
    this.el.removeObject3D(this.attrName);
    try {
      this.sound.disconnect();
    } catch (e) {
      // disconnect() will throw if it was never connected initially.
      warn('Audio source not properly disconnected');
    }
  },

  play: function () {
    if (!this.sound) { return; }
    if (this.sound.source.buffer && this.data.autoplay) {
      this.sound.play();
    }
    this.updateEventListener();
  },

  pause: function () {
    if (!this.sound) { return; }
    if (this.sound.source.buffer && this.sound.isPlaying) {
      this.sound.pause();
    }
    this.removeEventListener();
  },

  /**
   * Removes current sound object, creates new sound object, adds to entity.
   *
   * @returns {object} sound
   */
  setupSound: function () {
    var el = this.el;
    var sceneEl = el.sceneEl;
    var sound = this.sound;

    if (sound) {
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

    sound = this.sound = new THREE.PositionalAudio(listener);
    el.setObject3D(this.attrName, sound);

    sound.source.onended = function () {
      sound.onEnded();
      el.emit('sound-ended');
    };

    return sound;
  },

  playSound: function () {
    if (!this.sound.source.buffer) { return; }
    this.sound.play();
  },

  stopSound: function () {
    if (!this.sound.source.buffer) { return; }
    this.sound.stop();
  }
});
