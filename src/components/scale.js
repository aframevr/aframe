var registerComponent = require('../core/register-component');

module.exports.Component = registerComponent('scale', {
  update: {
    value: function () {
      var data = this.data;
      var object3D = this.el.object3D;
      object3D.scale.set(data.x, data.y, data.z);
    }
  }
});
