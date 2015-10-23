var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

module.exports.Component = registerComponent('geometry', {
  defaults: {
    value: {
      height: 5,
      width: 5,
      depth: 5,
      radius: 5,
      tube: 2,
      segments: 32,
      segmentsWidth: 36,
      segmentsHeight: 18,
      segmentsRadius: 36,
      thetaStart: 0,
      thetaLength: 6.3,
      innerRadius: 5,
      outerRadius: 7,
      openEnded: false
    }
  },

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
      var data = this.data;
      var geometry;
      switch (data.primitive) {
        case 'box':
          geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
          break;
        case 'circle':
          geometry = new THREE.CircleGeometry(data.radius, data.segments, data.thetaStart, data.thetaLength);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(data.radius, data.radius, data.height, data.segmentsRadius, data.segmentsHeight, data.openEnded, data.thetaStart, data.thetaLength);
          break;
        case 'plane':
          geometry = new THREE.PlaneBufferGeometry(data.width, data.height);
          break;
        case 'ring':
          geometry = new THREE.RingGeometry(data.innerRadius, data.outerRadius, data.segments);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(data.radius, data.segmentsWidth, data.segmentsHeight);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(data.radius, data.tube, data.segments, data.segments);
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
