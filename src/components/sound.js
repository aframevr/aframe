var debug = require('../utils/debug');
var diff = require('../utils').diff;
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../../lib/three');

var warn = debug('components:sound:warn');

/**
 * Sound component.
 *
 * @param {bool} [autoplay=false]
 * @param {string} on
 * @param {bool} [loop=false]
 * @param {number} [volume=1]
 */
module.exports.Component = registerComponent('sound', {
  schema: {
    src: { default: '' },
    on: { default: 'click' },
    autoplay: { default: false },
    loop: { default: false },
    volume: { default: 1 }
  },

  init: function () {
    this.listener = null;
    this.sound = null;
  },

  update: function (oldData) {
    var data = this.data;
    var diffData = diff(oldData || {}, data);
    var el = this.el;
    var sound = this.sound;
    var src = data.src;
    var srcChanged = 'src' in diffData;

    // Create new sound if not yet created or changing `src`.
    if (srcChanged) {
      if (!src) {
        warn('Audio source was not specified with `src`');
        return;
      }
      sound = this.setupSound();
    }

    if (srcChanged || 'autoplay' in diffData) {
      sound.autoplay = data.autoplay;
    }

    if (srcChanged || 'loop' in diffData) {
      sound.setLoop(data.loop);
    }

    if (srcChanged || 'volume' in diffData) {
      sound.setVolume(data.volume);
    }

    if ('on' in diffData) {
      if (oldData && oldData.on) {
        el.removeEventListener(oldData.on);
      }
      el.addEventListener(data.on, this.play.bind(this));
    }

    // All sound values set. Load in `src.
    if (srcChanged) {
      sound.load(src);
    }
  },

  remove: function () {
    this.el.object3D.remove(this.sound);
  },

  /**
   * Removes current sound object, creates new sound object, adds to entity.
   *
   * @returns {object} sound
   */
  setupSound: function () {
    var el = this.el;
    var listener;
    var sound = this.sound;

    if (sound) {
      this.stop();
      el.object3D.remove(sound);
    }

    listener = this.listener = new THREE.AudioListener();
    sound = this.sound = new THREE.Audio(listener);
    el.object3D.add(sound);
    return sound;
  },

  play: function () {
    this.sound.play();
  },

  stop: function () {
    this.sound.stop();
  },

  pause: function () {
    this.sound.pause();
  }
});
