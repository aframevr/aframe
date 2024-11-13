/* global AFRAME */
AFRAME.registerComponent('painting-changer', {
  init: function () {
    this.currentPaintingIndex = 0;
    this.paintings = [
      '#greco',
      '#helloaframe',
      '#mucha',
      '#scream',
      '#vangogh'
    ];
    this.el.sceneEl.addEventListener('loaded', this.onLoaded.bind(this));
  },

  nextPainting: function () {
    this.currentPaintingIndex++;
    if (this.currentPaintingIndex === this.paintings.length) {
      this.currentPaintingIndex = 0;
    }
    this.el.setAttribute('painting', 'src', this.paintings[this.currentPaintingIndex]);
  },

  onLoaded: function () {
    document.querySelector('.a-button').addEventListener('click', this.nextPainting.bind(this));
  }
});
