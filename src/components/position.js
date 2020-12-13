let registerComponent = require('../core/component').registerComponent;

module.exports.Component = registerComponent('position', {
  schema: {type: 'vec3'},

  update: function () {
    let object3D = this.el.object3D;
    let data = this.data;
    object3D.position.set(data.x, data.y, data.z);
  },

  remove: function () {
    // Pretty much for mixins.
    this.el.object3D.position.set(0, 0, 0);
  }
});
