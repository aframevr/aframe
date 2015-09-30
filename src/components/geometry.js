var registerComponent = require('../core/register-component');
var VRUtils = require('../vr-utils');
var THREE = require('../../lib/three');

var defaults = {
  size: 5,
  radius: 200,
  tube: 10,
  segments: 32
};

module.exports.Component = registerComponent('geometry', {
  update: {
    value: function () {
      var object3D = this.el.object3D;
      object3D.geometry = this.setupGeometry();
    }
  },

  setupGeometry: {
    value: function () {
      var data = this.data;
      var primitive = data.primitive;
      var geometry;
      var radius;
      switch (primitive) {
        case 'box':
          var width = data.width || defaults.size;
          var height = data.height || defaults.size;
          var depth = data.depth || defaults.size;
          geometry = new THREE.BoxGeometry(width, height, depth);
          break;
        case 'sphere':
          radius = data.radius || defaults.size;
          geometry = new THREE.SphereGeometry(radius, defaults.segments, defaults.segments);
          break;
        case 'torus':
          radius = data.radius || defaults.radius;
          var tube = data.tube || defaults.tube;
          geometry = new THREE.TorusGeometry(radius, tube);
          break;
        default:
          geometry = new THREE.Geometry();
          VRUtils.warn('Primitive type not supported');
          break;
      }
      this.geometry = geometry;
      return geometry;
    }
  }
});
