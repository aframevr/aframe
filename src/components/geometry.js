var debug = require('../utils/debug');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils');

var DEFAULT_RADIUS = 1;
var helperMatrix = new THREE.Matrix4();
var degToRad = THREE.Math.degToRad;
var warn = debug('components:geometry:warn');

/**
 * Geometry component. Combined with material component to make a mesh in 3D object.
 *
 * @param {number} [arc=360] -
 *   Used by torus. A central angle that determines arc length of the torus. In degrees.
 * @param {number} [depth=2] - Used by box. Depth of the sides on the Z axis.
 * @param {number} [height=2] -
 *   Used by box, cylinder, plane. Height of the sides on the Y axis.
 * @param {bool} [openEnded=false] - Used by cylinder.
 * @param {number} [p=2] - Used by torusKnot. Coprime of q.
 * @param {number} [primitive=null] - type of shape (e.g., box, sphere).
 * @param {number} [q=3] - Used by torusKnot. Coprime of p.
 * @param {number} [radius=1] - Used by circle, cylinder, ring, sphere, torus, torusKnot.
 * @param {number} [radiusBottom=1] - Used by cylinder.
 * @param {number} [radiusInner=0.8] - Used by ring.
 * @param {number} [radiusOuter=1.2] - Used by ring.
 * @param {number} [radiusTop=1] - Used by cylinder.
 * @param {number} [radiusTube=0.2] - Used by torus. Tube radius.
 * @param {number} [scaleHeight=1] - Used by torusKnot.
 * @param {number} [segments=8] - Used by circle. Number of segments.
 * @param {number} [segmentsHeight=18] - Used by cylinder, sphere. Number of segments.
 * @param {number} [segmentsPhi=8] - Used by ring.
 * @param {number} [segmentsRadial=36] - Used by cylinder. Number of segments.
 * @param {number} [segmentsTheta=8] -
 *   Used by ring. Number of segments. A higher number means the ring will be more round.
 *   Minimum is 3.
 * @param {number} [segmentsTubular=8] - Used by torus, torusKnot. Number of segments.
 * @param {number} [segmentsWidth=36] - Used by sphere.
 * @param {number} [thetaLength=360] - Used by circle, cylinder, ring. In degrees.
 * @param {number} [thetaStart=0] - Used by circle, cylinder, ring. In degrees.
 * @param {string} translate -
 *   Defined as a coordinate (e.g., `-1 0 5`) that translates geometry vertices. Useful for
 *   effectively changing the pivot point.
 * @param {number} [width=2] - Used by box, plane.
 */
module.exports.Component = registerComponent('geometry', {
  schema: {
    arc: { default: 360, if: { primitive: ['torus'] } },
    depth: { default: 2, min: 0, if: { primitive: ['box'] } },
    height: { default: 2, min: 0, if: { primitive: ['box', 'plane'] } },
    openEnded: { default: false, if: { primitive: ['cylinder'] } },
    p: { default: 2, if: { primitive: ['torusKnot'] }, type: 'int' },
    primitive: {
      default: '',
      oneOf: ['', 'box', 'circle', 'cylinder', 'plane',
              'ring', 'sphere', 'torus', 'torusKnot'] },
    q: { default: 3, if: { primitive: ['torusKnot'] }, type: 'int' },
    phiLength: { default: 360, if: { primitive: ['sphere'] } },
    phiStart: { default: 0, min: 0, if: { primitive: ['sphere'] } },
    radius: { default: DEFAULT_RADIUS, min: 0, if: { primitive: ['circle', 'cylinder', 'sphere', 'torus', 'torusKnot'] } },
    radiusBottom: { default: DEFAULT_RADIUS, min: 0, if: { primitive: ['cylinder'] } },
    radiusInner: { default: 0.8, min: 0, if: { primitive: ['ring'] } },
    radiusOuter: { default: 1.2, min: 0, if: { primitive: ['ring'] } },
    radiusTop: { default: DEFAULT_RADIUS, if: { primitive: ['cylinder'] } },
    radiusTubular: { default: 0.2, min: 0, if: { primitive: ['torus'] } },
    scaleHeight: { default: 1, min: 0, if: { primitive: ['torusKnot'] } },
    segments: { default: 8, min: 0, if: { primitive: ['circle'] }, type: 'int' },
    segmentsHeight: { default: 18, min: 0, if: { primitive: ['cylinder', 'sphere'] }, type: 'int' },
    segmentsPhi: { default: 8, min: 0, if: { primitive: ['ring'] }, type: 'int' },
    segmentsRadial: { default: 36, min: 0, if: { primitive: ['cylinder'] }, type: 'int' },
    segmentsTheta: { default: 8, min: 0, if: { primitive: ['ring'] }, type: 'int' },
    segmentsTubular: { default: 8, min: 0, if: { primitive: ['torus', 'torusKnot'] }, type: 'int' },
    segmentsWidth: { default: 36, min: 0, if: { primitive: ['sphere'] }, type: 'int' },
    thetaLength: { default: 360, min: 0, if: { primitive: ['circle', 'cylinder', 'ring',
                                                           'sphere'] } },
    thetaStart: { default: 0, if: { primitive: ['circle', 'cylinder', 'ring', 'sphere'] } },
    translate: { type: 'vec3' },
    width: { default: 2, min: 0, if: { primitive: ['box', 'plane'] } }
  },

  /**
   * Creates a new geometry on every update as there's not an easy way to
   * update a geometry that would be faster than just creating a new one.
   */
  update: function (previousData) {
    previousData = previousData || {};
    var data = this.data;
    var currentTranslate = previousData.translate || this.schema.translate.default;
    var diff = utils.diff(previousData, data);
    var geometry = this.el.object3D.geometry;
    var geometryNeedsUpdate = !(Object.keys(diff).length === 1 && 'translate' in diff);
    var translateNeedsUpdate = !utils.deepEqual(data.translate, currentTranslate);

    if (geometryNeedsUpdate) {
      geometry = this.el.object3D.geometry = getGeometry(this.data, this.schema);
    }
    if (translateNeedsUpdate) {
      applyTranslate(geometry, data.translate, currentTranslate);
    }
  },

  /**
   * Removes geometry on remove (callback).
   */
  remove: function () {
    this.el.object3D.geometry = new THREE.Geometry();
  }
});

/**
 * Creates a three.js geometry.
 *
 * @param {object} data
 * @param {object} schema
 * @returns {object} geometry
 */
function getGeometry (data, schema) {
  if (data.primitive === 'cube') {
    warn('geometry.primitive="cube" should be "box"');
  }

  switch (data.primitive) {
    case 'box': {
      return new THREE.BoxGeometry(data.width, data.height, data.depth);
    }
    case 'circle': {
      return new THREE.CircleGeometry(
        data.radius, data.segments, degToRad(data.thetaStart), degToRad(data.thetaLength));
    }
    case 'cone': {
      return new THREE.CylinderGeometry(
        data.radiusTop, data.radiusBottom, data.height,
        data.segmentsRadial, data.segmentsHeight,
        data.openEnded, degToRad(data.thetaStart), degToRad(data.thetaLength));
    }
    case 'cylinder': {
      return new THREE.CylinderGeometry(
        data.radius, data.radius, data.height,
        data.segmentsRadial, data.segmentsHeight,
        data.openEnded, degToRad(data.thetaStart), degToRad(data.thetaLength));
    }
    case 'plane': {
      return new THREE.PlaneBufferGeometry(data.width, data.height);
    }
    case 'ring': {
      return new THREE.RingGeometry(
        data.radiusInner, data.radiusOuter, data.segmentsTheta, data.segmentsPhi,
        degToRad(data.thetaStart), degToRad(data.thetaLength));
    }
    case 'sphere': {
      // thetaLength's default for spheres is different from those of the other geometries.
      // For now, we detect if thetaLength is exactly 360 to switch to a different default.
      if (data.thetaLength === 360) { data.thetaLength = 180; }
      return new THREE.SphereBufferGeometry(
        data.radius, data.segmentsWidth, data.segmentsHeight, degToRad(data.phiStart),
        degToRad(data.phiLength), degToRad(data.thetaStart), degToRad(data.thetaLength));
    }
    case 'torus': {
      return new THREE.TorusGeometry(
        data.radius, data.radiusTubular * 2, data.segmentsRadial, data.segmentsTubular,
        degToRad(data.arc));
    }
    case 'torusKnot': {
      return new THREE.TorusKnotGeometry(
        data.radius, data.radiusTubular * 2, data.segmentsRadial, data.segmentsTubular,
        data.p, data.q, data.scaleHeight);
    }
    default: {
      warn('Primitive type not supported: ' + data.primitive);
      return new THREE.Geometry();
    }
  }
}

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
