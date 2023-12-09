var registerComponent = require('../core/component').registerComponent;

module.exports.Component = registerComponent('scale', {
  schema: {
    type: 'vec3',
    default: {x: 1, y: 1, z: 1}
  },

  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    object3D.scale.set(data.x, data.y, data.z);
  },

  remove: function () {
    // Pretty much for mixins.
    this.el.object3D.scale.set(1, 1, 1);
  }
});
