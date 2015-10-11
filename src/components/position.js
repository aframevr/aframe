var registerComponent = require('../core/register-component').registerComponent;

module.exports.Component = registerComponent('position', {
  defaults: {
    value: {
      x: 0,
      y: 0,
      z: 0
    }
  },

  update: {
    value: function () {
      var object3D = this.el.object3D;
      var data = this.data;
      // Updates three.js object
      object3D.position.set(data.x, data.y, data.z);
    }
  }
});
