/* global THREE */
let register = require('../../core/component').registerComponent;
let COMPONENTS = require('../../core/component').components;

module.exports.Component = register('background', {
  schema: {
    color: {type: 'color', default: 'black'},
    transparent: {default: false}
  },
  update: function () {
    let data = this.data;
    let object3D = this.el.object3D;
    if (data.transparent) {
      object3D.background = null;
      return;
    }
    object3D.background = new THREE.Color(data.color);
  },

  remove: function () {
    let data = this.data;
    let object3D = this.el.object3D;
    if (data.transparent) {
      object3D.background = null;
      return;
    }
    object3D.background = COMPONENTS[this.name].schema.color.default;
  }
});
