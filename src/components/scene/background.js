/* global THREE */
var register = require('../../core/component').registerComponent;

module.exports.Component = register('background', {
  schema: {
    color: { type: 'color', default: 'black' },
    transparent: { default: false }
  },
  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;

    if (data.transparent) {
      object3D.background = null;
    } else {
      object3D.background = new THREE.Color(data.color);
    }
  },

  remove: function () {
    var object3D = this.el.object3D;
    object3D.background = null;
  }
});
