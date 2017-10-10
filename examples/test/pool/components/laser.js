/* global AFRAME */

AFRAME.registerComponent('laser', {
  schema: {
    speed: { default: 1 }
  },

  init: function () {
    var el = this.el;
    var geometry = 'primitive: box; height: 2; width: 0.1; depth: 0.1';
    var material = 'color: yellow';
    el.setAttribute('geometry', geometry);
    el.setAttribute('material', material);
  },

  tick: function () {
    var el = this.el;
    var position = el.getAttribute('position');
    position.y += this.data.speed;
    el.setAttribute('position', position);
  }
});
