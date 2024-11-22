var register = require('../core/component').registerComponent;

module.exports.Component = register('hide-on-enter-ar', {
  init: function () {
    var self = this;
    this.el.sceneEl.addEventListener('enter-vr', function () {
      if (self.el.sceneEl.is('ar-mode')) {
        self.el.object3D.visible = false;
      }
    });
    this.el.sceneEl.addEventListener('exit-vr', function () {
      self.el.object3D.visible = true;
    });
  }
});
