var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

/**
 * Geometry component. Combined with material component to make mesh in
 * 3D object.
 *
 * @param {number} depth
 * @param {number} height
 * @param {number} innerRadius
 * @param {bool} openEnded
 * @param {number} outerRadius
 * @param {number} [p=2] - coprime of q that helps define torus knot.
 * @param {number} [q=3] - coprime of p that helps define torus knot.
 * @param {number} [primitive=null] - type of shape (e.g., box, sphere).
 * @param {number} radius
 * @param {number} segments
 * @param {number} segmentsHeight
 * @param {number} segmentsRadius
 * @param {number} segmentsWidth
 * @param {number} thetaLength
 * @param {number} thetaSTart
 * @param {number} tube
 * @param {number} tubularSegments
 * @param {number} width
 */
module.exports.Component = registerComponent('geometry', {
  defaults: {
    value: {
      depth: 5,
      height: 5,
      innerRadius: 5,
      openEnded: false,
      outerRadius: 7,
      p: 2,
      primitive: null,
      q: 3,
      radius: 5,
      segments: 32,
      segmentsHeight: 18,
      segmentsRadius: 36,
      segmentsWidth: 36,
      thetaLength: 6.3,
      thetaStart: 0,
      tube: 2,
      tubularSegments: 8,
      width: 5
    }
  },

  update: {
    value: function () {
      this.el.object3D.geometry = this.getGeometry();
    }
  },

  getGeometry: {
    value: function () {
      var data = this.data;
      switch (data.primitive) {
        case 'box': {
          return new THREE.BoxGeometry(data.width, data.height, data.depth);
        }
        case 'circle': {
          return new THREE.CircleGeometry(
            data.radius, data.segments, data.thetaStart, data.thetaLength);
        }
        case 'cylinder': {
          return new THREE.CylinderGeometry(
            data.radius, data.radius, data.height, data.segmentsRadius,
            data.segmentsHeight, data.openEnded, data.thetaStart,
            data.thetaLength);
        }
        case 'plane': {
          return new THREE.PlaneBufferGeometry(data.width, data.height);
        }
        case 'ring': {
          return new THREE.RingGeometry(
            data.innerRadius, data.outerRadius, data.segments);
        }
        case 'sphere': {
          return new THREE.SphereGeometry(
            data.radius, data.segmentsWidth, data.segmentsHeight);
        }
        case 'torus': {
          return new THREE.TorusGeometry(
            data.radius, data.tube, data.segments, data.segments);
        }
        case 'torusKnot': {
          return new THREE.TorusKnotGeometry(
            data.radius, data.tube, data.segments, data.tubularSegments,
            data.p, data.q);
        }
        default: {
          VRUtils.warn('Primitive type not supported: ' + data.primitive);
          return new THREE.Geometry();
        }
      }
    }
  }
});
