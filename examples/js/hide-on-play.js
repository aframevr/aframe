/* global AFRAME */
AFRAME.registerComponent('hide-on-play', {
  schema: {type: 'selector'},
  init: function () {
    this.onPlaying = this.onPlaying.bind(this);
    this.onPause = this.onPause.bind(this);
  },
  play: function () {
    if (this.data) {
      this.data.addEventListener('playing', this.onPlaying);
      this.data.addEventListener('pause', this.onPause);
    }
  },
  pause: function () {
    if (this.data) {
      this.data.removeEventListener('playing', this.onPlaying);
      this.data.removeEventListener('pause', this.onPause);
    }
  },
  onPlaying: function (evt) {
    this.el.setAttribute('visible', false);
  },
  onPause: function (evt) {
    this.el.setAttribute('visible', true);
  }
});
