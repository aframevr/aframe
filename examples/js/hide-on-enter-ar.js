/* global AFRAME */
AFRAME.registerComponent('hide-on-enter-ar', {
  init: function () {
    var self = this;
    this.el.sceneEl.addEventListener('enter-vr', function () {
      if (self.el.sceneEl.is('ar-mode')) { self.el.setAttribute('visible', false); }
    });
    this.el.sceneEl.addEventListener('exit-vr', function () { self.el.setAttribute('visible', true); });
  }
});
