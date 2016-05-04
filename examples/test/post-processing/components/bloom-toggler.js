/* global AFRAME */

AFRAME.registerComponent('bloom-toggler', {
  init: function () {
    this.evHandler = this.clickHandler.bind(this);
    window.addEventListener('contextmenu', this.evHandler);
  },

  remove: function () {
    window.removeEventListener('contextmenu', this.evHandler);
  },

  clickHandler: function () {
    var scene = this.el.sceneEl;
    console.log('EXECUTION PRECEDENCE', this.el.sceneEl.precedence.getOrder('component:execution'));

    if (scene.hasAttribute('bloom')) {
      scene.removeAttribute('bloom');
    } else {
      scene.setAttribute('bloom', 'intensity: 0.5');
    }
  }
});
