var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

var DEFAULT_RADIUS = 5;

/**
 * Geometry component. Combined with material component to make a mesh in
 * 3D object.
 *
 * TODO: rename component attributes to be consistent with three.js parameters
 *       names is exposed in object3D.geometry.parameters.
 *
 * @param {number} [arc=2 * PI]
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
 * @param {number} thetaStart
 * @param {number} tube
 * @param {number} tubularSegments
 * @param {number} width
 */
module.exports.Component = registerComponent('geometry', {
  defaults: {
    value: {
      arc: 2 * Math.PI,
      depth: 5,
      height: 5,
      innerRadius: 5,
      openEnded: false,
      outerRadius: 7,
      p: 2,
      primitive: '',
      q: 3,
      radius: DEFAULT_RADIUS,
      radiusTop: DEFAULT_RADIUS,
      radiusBottom: DEFAULT_RADIUS,
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

  /**
   * Creates a new geometry on every update as there's not an easy way to
   * update a geometry that would be faster than just creating a new one.
   */
  update: {
    value: function () {
      this.el.object3D.geometry = this.getGeometry();
    }
  },

  /**
   * Removes geometry on remove (callback).
   */
  remove: {
    value: function () {
      this.el.object3D.geometry = null;
    }
  },

  /**
   * @returns {object} geometry
   */
  getGeometry: {
    value: function () {
      var data = this.data;
      var defaults = this.defaults;

      var radiusTop = data.radius;
      var radiusBottom = data.radius;
      if (data.radius === defaults.radius) {
        radiusTop = data.radiusTop;
        radiusBottom = data.radiusBottom;
      }

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
            radiusTop, radiusBottom, data.height, data.segmentsRadius,
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
            data.radius, data.tube, data.segments, data.tubularSegments,
            data.arc);
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
