var degToRad = require('../lib/three').Math.degToRad;
var registerComponent = require('../core/component').registerComponent;

module.exports.Component = registerComponent('rotation', {
  schema: { type: 'vec3' },

  /**
   * Updates object3D rotation.
   */
  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    object3D.rotation.set(degToRad(data.x), degToRad(data.y), degToRad(data.z));
    object3D.rotation.order = 'YXZ';
  }
});
