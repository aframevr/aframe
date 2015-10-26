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
    value: function () {
      var data = this.data;
      var src = data.src;
      var sound = this.getSound();
      if (!src) {
        utils.warn('Sound src not specified');
        return;
      }
      sound.load(src);
      sound.autoplay = data.autoplay;
      sound.setLoop(data.loop);
      sound.setVolume(data.volume);
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
