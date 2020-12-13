/* global AFRAME */

AFRAME.registerComponent('spaceship', {
  init: function () {
    let el = this.el;
    let geometry = 'primitive: box; height: 2; width: 2; depth: 2;';
    let material = 'color: #167341; roughness: 1.0; metalness: 0.2;';
    el.setAttribute('geometry', geometry);
    el.setAttribute('material', material);
    this.onKeyDown = this.onKeyDown.bind(this);
  },

  play: function () {
    this.attachKeyEventListeners();
  },

  pause: function () {
    this.removeKeyEventListeners();
  },

  onKeyDown: function (evt) {
    let el = this.el;
    let laserEl;
    let position;
    if (evt.keyCode !== 32) { return; }
    laserEl = el.sceneEl.components.pool.requestEntity();
    if (!laserEl) { return; }
    position = el.getAttribute('position');
    laserEl.setAttribute('position', position);
    laserEl.play();
    setTimeout(this.laserDestroyer(laserEl), 1000);
  },

  laserDestroyer: function (el) {
    let laserEl = el;
    let component = this;
    return function () {
      if (!laserEl.isPlaying) {
        setTimeout(component.laserDestroyer(laserEl), 1000);
        return;
      }
      this.el.sceneEl.components.pool.returnEntity(laserEl);
    }.bind(this);
  },

  attachKeyEventListeners: function () {
    window.addEventListener('keydown', this.onKeyDown);
  },

  removeKeyEventListeners: function () {
    window.removeEventListener('keydown', this.onKeyDown);
  }
});
