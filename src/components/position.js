var registerComponent = require('../core/register-component');

module.exports.Component = registerComponent('position', {
  update: {
    value: function () {
      var object3D = this.el.object3D;
      var data = this.data;
      // Updates three.js object
      object3D.position.set(data.x, data.y, data.z);
    }
  }
});
