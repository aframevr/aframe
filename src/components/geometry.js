var registerComponent = require('../core/register-component');
var VRUtils = require('../vr-utils');
var THREE = require('../../lib/three');

var defaults = {
  height: 5,
  width: 5,
  depth: 5,
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
      var data = {};
      var geometry;
      VRUtils.mixin(data, defaults);
      VRUtils.mixin(data, this.data);
      switch (data.primitive) {
        case 'box':
          geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(data.radius, defaults.segments, defaults.segments);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(data.radius, data.tube);
          break;
        case 'plane':
          geometry = new THREE.PlaneBufferGeometry(data.width, data.height);
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
