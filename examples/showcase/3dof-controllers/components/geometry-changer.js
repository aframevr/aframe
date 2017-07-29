/* global AFRAME */
AFRAME.registerComponent('geometry-changer', {
  init: function () {
    this.el.addEventListener('raycaster-intersected', this.onIntersected.bind(this));
    this.el.addEventListener('raycaster-intersected-cleared', this.onIntersectedCleared.bind(this));
  },

  onIntersected: function () {
    this.el.setAttribute('color', 'red');
  },

  onIntersectedCleared: function () {
    this.el.setAttribute('color', 'blue');
  }
});
