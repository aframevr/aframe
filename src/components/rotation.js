let degToRad = require('../lib/three').Math.degToRad;
let registerComponent = require('../core/component').registerComponent;

module.exports.Component = registerComponent('rotation', {
  schema: {type: 'vec3'},

  /**
   * Updates object3D rotation.
   */
  update: function () {
    let data = this.data;
    let object3D = this.el.object3D;
    object3D.rotation.set(degToRad(data.x), degToRad(data.y), degToRad(data.z));
    object3D.rotation.order = 'YXZ';
  },

  remove: function () {
    // Pretty much for mixins.
    this.el.object3D.rotation.set(0, 0, 0);
  }
});
