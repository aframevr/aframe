var registerComponent = require('./register-component');
var VRUtils = require('../vr-utils');
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('geometry', {
  update: {
    value: function () {
      var object3D = this.el.object3D;
      object3D.geometry = this.setupGeometry();
    }
  },

  setupGeometry: {
    value: function () {
      var primitive = this.primitive;
      var geometry;
      var radius;
      switch (primitive) {
        case 'box':
          var width = this.width || 5;
          var height = this.height || 5;
          var depth = this.depth || 5;
          geometry = new THREE.BoxGeometry(width, height, depth);
          break;
        case 'sphere':
          radius = this.radius || 5;
          geometry = new THREE.SphereGeometry(radius, 32, 32);
          break;
        case 'torus':
          radius = this.radius || 200;
          var tube = this.tube || 10;
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
