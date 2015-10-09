var registerComponent = require('../core/register-component');
var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

var defaults = {
  height: 5,
  width: 5,
  depth: 5,
  radius: 5,
  tube: 2,
  segments: 32
};

module.exports.Component = registerComponent('geometry', {
  update: {
    value: function () {
      this.setupGeometry();
    }
  },

  setupGeometry: {
    value: function () {
      var object3D = this.el.object3D;
      object3D.geometry = this.getGeometry();
    }
  },

  getGeometry: {
    value: function () {
      var data = this.applyDefaults(defaults);
      var geometry;
      switch (data.primitive) {
        case 'box':
          geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
          break;
        case 'circle':
          geometry = new THREE.CircleGeometry(data.radius, defaults.segments);
          break;
        case 'plane':
          geometry = new THREE.PlaneBufferGeometry(data.width, data.height);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(data.radius, defaults.segments, defaults.segments);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(data.radius, data.tube, defaults.segments, defaults.segments);
          break;
        default:
          geometry = new THREE.Geometry();
          VRUtils.warn('Primitive type not supported');
          break;
      }
      return geometry;
    }
  }
});
