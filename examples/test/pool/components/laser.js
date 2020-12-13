/* global AFRAME */

AFRAME.registerComponent('laser', {
  schema: {
    speed: { default: 1 }
  },

  init: function () {
    let el = this.el;
    let geometry = 'primitive: box; height: 2; width: 0.1; depth: 0.1';
    let material = 'color: yellow';
    el.setAttribute('geometry', geometry);
    el.setAttribute('material', material);
  },

  tick: function () {
    let el = this.el;
    let position = el.getAttribute('position');
    position.y += this.data.speed;
    el.setAttribute('position', position);
  }
});
