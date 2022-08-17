/* global AFRAME, THREE */

AFRAME.registerComponent('click-color-change', {

  init () {
    this.el.addEventListener('click', this.click.bind(this));
    this.r = 0;
    this.g = 0;
    this.b = 0;

    // disable right-click context menu
    window.addEventListener('contextmenu', event => event.preventDefault());
  },

  click (event) {
    const mouseEvent = event.detail.mouseEvent;

    if (!mouseEvent) return;

    if (mouseEvent.button === 0) {
      this.r = 1 - this.r;
    } else if (mouseEvent.button === 1) {
      this.g = 1 - this.g;
    } else if (mouseEvent.button === 2) {
      this.b = 1 - this.b;
    }

    const color = new THREE.Color(this.r, this.g, this.b);
    this.el.setAttribute('color', `#${color.getHexString()}`);
  }
});
