var geometries = require('../core/geometry').geometries;
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils');

var helperMatrix = new THREE.Matrix4();
var error = utils.debug('components:geometry:error');

/**
 * Geometry component. Combined with material component to make a mesh in 3D object.
 * Extended with registered geometries.
 */
module.exports.Component = registerComponent('geometry', {
  schema: {
    primitive: {default: ''},
    translate: {type: 'vec3'}
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
    var geometryNeedsUpdate = !(Object.keys(diff).length === 1 && 'translate' in diff);
    var translateNeedsUpdate = !utils.deepEqual(data.translate, currentTranslate);

    if (geometryNeedsUpdate) { this.setGeometry(); }
    if (translateNeedsUpdate) {
      applyTranslate(this.el.getObject3D('mesh').geometry, data.translate, currentTranslate);
    }
  },

  /**
   * Removes geometry on remove (callback).
   */
  remove: function () {
    this.el.getObject3D('mesh').geometry.dispose();
    this.el.getObject3D('mesh').geometry = new THREE.Geometry();
  },

  /**
   * Create geometry and set on mesh.
   */
  setGeometry: function () {
    var data = this.data;
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
    var geometryInstance;
    var geometryType = data.primitive;
    var GeometryClass = geometries[geometryType] && geometries[geometryType].Geometry;

    if (!GeometryClass) { throw new Error('Unknown geometry `' + geometryType + '`'); }

    // Create geometry instance. Set it up. Have it create the geometry.
    geometryInstance = new GeometryClass();
    geometryInstance.el = this.el;
    geometryInstance.init(data);
    this.geometry = geometryInstance.geometry;

    // Dispose and set.
    if (mesh.geometry) { mesh.geometry.dispose(); }
    mesh.geometry = this.geometry;
  },

  /**
   * Update geometry component schema based on geometry type.
   *
   * @param {object} data - New data passed by Component.
   */
  updateSchema: function (data) {
    var newGeometryType = data.primitive;
    var currentGeometryType = this.data && this.data.primitive;
    var schema = geometries[newGeometryType] && geometries[newGeometryType].schema;

    // Geometry has no schema.
    if (!schema) { error('Unknown geometry schema `' + newGeometryType + '`'); }
    // Nothing has changed.
    if (currentGeometryType && currentGeometryType === newGeometryType) { return; }

    this.extendSchema(schema);
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
