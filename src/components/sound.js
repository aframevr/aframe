var diff = require('../utils').diff;
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../utils');

var proto = {
  defaults: {
    value: {
      on: 'click',
      autoplay: false,
      loop: false,
      volume: 1
    }
  },

  update: {
    value: function (oldData) {
      var data = this.data;
      var diffData = diff(oldData || {}, data);
      var src = data.src;
      var sound = this.getSound();

      if ('src' in diffData) {
        if (!src) {
          utils.warn('Sound src not specified');
          return;
        }
        sound.load(src);
      }

      if ('autoplay' in diffData) {
        sound.autoplay = data.autoplay;
      }

      if ('loop' in diffData) {
        sound.setLoop(data.loop);
      }

      if ('volume' in diffData) {
        sound.setVolume(data.volume);
      }
    }
  },

  getSound: {
    value: function () {
      var el = this.el;
      var listener = this.listener = new THREE.AudioListener();
      var sound = this.sound = this.sound || new THREE.Audio(listener);
      el.object3D.add(sound);
      el.addEventListener(this.data.on, this.play.bind(this));
      return sound;
    }
  },

  remove: {
    value: function () {
      this.el.object3D.remove(this.sound);
    }
  },

  play: {
    value: function () {
      this.sound.play();
    }
  },

  stop: {
    value: function () {
      this.sound.stop();
    }
  },

  pause: {
    value: function () {
      this.sound.pause();
    }
  }

};

module.exports.Component = registerComponent('sound', proto);
