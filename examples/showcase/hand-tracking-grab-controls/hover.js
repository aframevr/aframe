/* global AFRAME */
AFRAME.registerComponent('hover', {
  init: function () {
    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.modalEl = this.el.querySelector('[spatial-modal]');
    this.el.addEventListener('obbcollisionstarted', this.onCollisionStarted);
    this.el.addEventListener('obbcollisionended', this.onCollisionEnded);
  },

  onCollisionStarted: function () {
    this.modalEl.setAttribute('spatial-modal', 'color', 'red');
  },

  onCollisionEnded: function () {
    this.modalEl.setAttribute('spatial-modal', 'color', 'white');
  }
});
