var registerComponent = require('../core/register-component');

module.exports.Component = registerComponent('scale', {
  update: {
    value: function () {
      var object3D = this.el.object3D;
      object3D.scale.set(this.x, this.y, this.z);
    }
  }
});
