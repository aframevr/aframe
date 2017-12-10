/* global THREE */
var register = require('../../core/component').registerComponent;

module.exports.Component = register('background', {
  schema: {color: {type: 'color', default: 'black'}},
  update: function () {
    this.el.object3D.background = new THREE.Color(this.data.color);
  }
});
