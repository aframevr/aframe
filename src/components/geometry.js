var debug = require('../utils/debug');
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../utils');

var DEFAULT_RADIUS = 1;
var helperMatrix = new THREE.Matrix4();
var warn = debug('components:geometry:warn');

/**
 * Geometry component. Combined with material component to make a mesh in 3D object.
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
 * @param {number} [p=2] - Coprime of q that helps define torus knot.
 * @param {number} [primitive=null] - Type of shape (e.g., box, sphere).
 * @param {number} [q=3] - Coprime of p that helps define torus knot.
 * @param {number} radius
 * @param {number} segments
 * @param {number} segmentsHeight
 * @param {number} segmentsRadius
 * @param {number} segmentsWidth
 * @param {number} thetaLength
 * @param {number} thetaStart
 * @param {string} translate -
 *   Defined as a coordinate (e.g., `-1 0 5`) that translates geometry vertices. Useful for
 *   effectively changing the pivot point.
 * @param {number} tube
 * @param {number} tubularSegments
 * @param {number} width
 */
module.exports.Component = registerComponent('geometry', {
  defaults: {
    value: {
      arc: 2 * Math.PI,
      depth: 2,
      height: 2,
      innerRadius: 0.8,
      openEnded: false,
      outerRadius: 1.2,
      p: 2,
      translate: { x: 0, y: 0, z: 0 },
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
      tube: 0.2,
      tubularSegments: 8,
      width: 2
    }
  },

  /**
   * Creates a new geometry on every update as there's not an easy way to
   * update a geometry that would be faster than just creating a new one.
   */
  update: {
    value: function (previousData) {
      previousData = previousData || {};
      var data = this.data;
      var currentTranslate = previousData.translate || this.defaults.translate;
      var diff = utils.diff(previousData, data);
      var geometry = this.el.object3D.geometry;
      var geometryNeedsUpdate = !(Object.keys(diff).length === 1 && 'translate' in diff);
      var translateNeedsUpdate = !utils.deepEqual(data.translate, currentTranslate);

      if (geometryNeedsUpdate) {
        geometry = this.el.object3D.geometry = this.getGeometry();
      }
      if (translateNeedsUpdate) {
        applyTranslate(geometry, data.translate, currentTranslate);
      }
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
      var radiusBottom;
      var radiusTop;

      switch (data.primitive) {
        case 'box': {
          return new THREE.BoxGeometry(data.width, data.height, data.depth);
        }
        case 'circle': {
          return new THREE.CircleGeometry(
            data.radius, data.segments, data.thetaStart, data.thetaLength);
        }
        case 'cylinder': {
          // Shortcut for specifying both top and bottom radius.
          radiusTop = data.radius;
          radiusBottom = data.radius;
          if (data.radius === defaults.radius) {
            radiusTop = data.radiusTop;
            radiusBottom = data.radiusBottom;
          }
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
          warn('Primitive type not supported: ' + data.primitive);
          return new THREE.Geometry();
        }
      }
    }
  }
});

/**
 * Translates geometry vertices.
 *
 * @param {object} geometry - three.js geometry.
 * @param {object} translate - New translation.
 * @param {object} currentTranslate - Currently applied translation.
 */
function applyTranslate (geometry, translate, currentTranslate) {
  var translation = helperMatrix.makeTranslation(
    translate.x - currentTranslate.x,
    translate.y - currentTranslate.y,
    translate.z - currentTranslate.z
  );
  geometry.applyMatrix(translation);
  geometry.verticesNeedsUpdate = true;
}
