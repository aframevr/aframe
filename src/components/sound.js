var registerComponent = require('../core/component').registerComponent;
var debug = require('../utils/debug');
var THREE = require('../lib/three');

var warn = debug('components:sound:warn');

/**
 * Sound component.
 */
module.exports.Component = registerComponent('sound', {
  schema: {
    autoplay: {default: false},
    distanceModel: {default: 'inverse', oneOf: ['linear', 'inverse', 'exponential']},
    loop: {default: false},
    loopStart: {default: 0},
    loopEnd: {default: 0},
    maxDistance: {default: 10000},
    on: {default: ''},
    poolSize: {default: 1},
    positional: {default: true},
    refDistance: {default: 1},
    rolloffFactor: {default: 1},
    src: {type: 'audio'},
    volume: {default: 1}
  },

  multiple: true,

  init: function () {
    var self = this;

    this.listener = null;
    this.audioLoader = new THREE.AudioLoader();
    this.pool = new THREE.Group();
    this.loaded = false;
    this.mustPlay = false;

    // Don't pass evt because playSound takes a function as parameter.
    this.playSoundBound = function () { self.playSound(); };
  },

  update: function (oldData) {
    var data = this.data;
    var i;
    var sound;
    var srcChanged = data.src !== oldData.src;

    // Create new sound if not yet created or changing `src`.
    if (srcChanged) {
      if (!data.src) { return; }
      this.setupSound();
    }

    for (i = 0; i < this.pool.children.length; i++) {
      sound = this.pool.children[i];
      if (data.positional) {
        sound.setDistanceModel(data.distanceModel);
        sound.setMaxDistance(data.maxDistance);
        sound.setRefDistance(data.refDistance);
        sound.setRolloffFactor(data.rolloffFactor);
      }
      sound.setLoop(data.loop);
      sound.setLoopStart(data.loopStart);

      // With a loop start specified without a specified loop end, the end of the loop should be the end of the file
      if (data.loopStart !== 0 && data.loopEnd === 0) {
        sound.setLoopEnd(sound.buffer.duration);
      } else {
        sound.setLoopEnd(data.loopEnd);
      }

      sound.setVolume(data.volume);
      sound.isPaused = false;
    }

    if (data.on !== oldData.on) {
      this.updateEventListener(oldData.on);
    }

    // All sound values set. Load in `src`.
    if (srcChanged) {
      var self = this;

      this.loaded = false;
      this.audioLoader.load(data.src, function (buffer) {
        for (i = 0; i < self.pool.children.length; i++) {
          sound = self.pool.children[i];
          sound.setBuffer(buffer);
        }
        self.loaded = true;

        // Remove this key from cache, otherwise we can't play it again
        THREE.Cache.remove(data.src);
        if (self.data.autoplay || self.mustPlay) { self.playSound(self.processSound); }
        self.el.emit('sound-loaded', self.evtDetail, false);
      });
    }
  },

  pause: function () {
    this.stopSound();
    this.removeEventListener();
  },

  play: function () {
    if (this.data.autoplay) { this.playSound(); }
    this.updateEventListener();
  },

  remove: function () {
    var i;
    var sound;

    this.removeEventListener();

    if (this.el.getObject3D(this.attrName)) {
      this.el.removeObject3D(this.attrName);
    }

    try {
      for (i = 0; i < this.pool.children.length; i++) {
        sound = this.pool.children[i];
        sound.disconnect();
      }
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
    if (oldEvt) { el.removeEventListener(oldEvt, this.playSoundBound); }
    el.addEventListener(this.data.on, this.playSoundBound);
  },

  removeEventListener: function () {
    this.el.removeEventListener(this.data.on, this.playSoundBound);
  },

  /**
   * Removes current sound object, creates new sound object, adds to entity.
   *
   * @returns {object} sound
   */
  setupSound: function () {
    var el = this.el;
    var i;
    var sceneEl = el.sceneEl;
    var self = this;
    var sound;

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
    for (i = 0; i < this.data.poolSize; i++) {
      sound = this.data.positional
        ? new THREE.PositionalAudio(listener)
        : new THREE.Audio(listener);
      this.pool.add(sound);
    }
    el.setObject3D(this.attrName, this.pool);

    for (i = 0; i < this.pool.children.length; i++) {
      sound = this.pool.children[i];
      sound.onEnded = function () {
        this.isPlaying = false;
        self.el.emit('sound-ended', self.evtDetail, false);
      };
    }
  },

  /**
   * Pause all the sounds in the pool.
   */
  pauseSound: function () {
    var i;
    var sound;

    this.isPlaying = false;
    for (i = 0; i < this.pool.children.length; i++) {
      sound = this.pool.children[i];
      if (!sound.source || !sound.source.buffer || !sound.isPlaying || sound.isPaused) {
        continue;
      }
      sound.isPaused = true;
      sound.pause();
    }
  },

  /**
   * Look for an unused sound in the pool and play it if found.
   */
  playSound: function (processSound) {
    var found;
    var i;
    var sound;

    if (!this.loaded) {
      warn('Sound not loaded yet. It will be played once it finished loading');
      this.mustPlay = true;
      this.processSound = processSound;
      return;
    }

    found = false;
    this.isPlaying = true;
    for (i = 0; i < this.pool.children.length; i++) {
      sound = this.pool.children[i];
      if (!sound.isPlaying && sound.buffer && !found) {
        if (processSound) { processSound(sound); }
        sound.play();
        sound.isPaused = false;
        found = true;
        continue;
      }
    }

    if (!found) {
      warn('All the sounds are playing. If you need to play more sounds simultaneously ' +
           'consider increasing the size of pool with the `poolSize` attribute.', this.el);
      return;
    }

    this.mustPlay = false;
    this.processSound = undefined;
  },

  /**
   * Stop all the sounds in the pool.
   */
  stopSound: function () {
    var i;
    var sound;
    this.isPlaying = false;
    for (i = 0; i < this.pool.children.length; i++) {
      sound = this.pool.children[i];
      if (!sound.source || !sound.source.buffer) { return; }
      sound.stop();
    }
  }
});
