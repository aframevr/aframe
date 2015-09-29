var registerComponent = require('../core/register-component');

module.exports.Component = registerComponent('position', {
  update: {
    value: function () {
      var object3D = this.el.object3D;
      // Updates three.js object
      object3D.position.set(this.x, this.y, this.z);
    }
  }
});
