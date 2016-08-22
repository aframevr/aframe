var debug = require('../utils/debug');
var geometries = require('../core/geometry').geometries;
var geometryNames = require('../core/geometry').geometryNames;
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var dummyGeometry = new THREE.Geometry();
var warn = debug('components:geometry:warn');

/**
 * Geometry component. Combined with material component to make a mesh in 3D object.
 * Extended with registered geometries.
 */
module.exports.Component = registerComponent('geometry', {
  schema: {
    buffer: {default: true},
    mergeTo: {type: 'selector'},
    primitive: {default: 'box', oneOf: geometryNames},
    skipCache: {default: false}
  },

  init: function () {
    this.geometry = null;
  },

  /**
   * Talk to geometry system to get or create geometry.
   */
  update: function (previousData) {
    var data = this.data;
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
    var system = this.system;

    // Dispose old geometry if we created one.
    if (this.geometry) {
      system.unuseGeometry(previousData);
      this.geometry = null;
    }

    // Create new geometry.
    this.geometry = mesh.geometry = system.getOrCreateGeometry(data);
    if (data.mergeTo) {
      this.mergeTo(data.mergeTo);
    }
  },

  /**
   * Merge geometry to another entity's geometry.
   * Remove the entity from the scene. Not a reversible operation.
   *
   * @param {Element} toEl - Entity where the geometry will be merged to.
   */
  mergeTo: function (toEl) {
    var el = this.el;
    var mesh = el.getObject3D('mesh');
    var toMesh;

    if (!toEl) {
      warn('There is not a valid entity to merge the geometry to');
      return;
    }

    if (toEl === el) {
      warn('Source and target geometries cannot be the same for merge');
      return;
    }

    // Create mesh if entity does not have one.
    toMesh = toEl.getObject3D('mesh');
    if (!toMesh) {
      toMesh = toEl.getOrCreateObject3D('mesh', THREE.Mesh);
      toEl.setAttribute('material', el.getComputedAttribute('material'));
      return;
    }

    if (toMesh.geometry instanceof THREE.Geometry === false ||
        mesh.geometry instanceof THREE.Geometry === false) {
      warn('Geometry merge is only available for `THREE.Geometry` types. ' +
           'Check that both of the merging geometry and the target geometry have `buffer` ' +
           'set to false');
      return;
    }

    if (this.data.skipCache === false) {
      warn('Cached geometries are not allowed to merge. Set `skipCache` to true');
      return;
    }

    mesh.parent.updateMatrixWorld();
    toMesh.geometry.merge(mesh.geometry, mesh.matrixWorld);
    el.emit('geometry-merged', {mergeTarget: toEl});
    el.parentNode.removeChild(el);
  },

  /**
   * Tell geometry system that entity is no longer using the geometry.
   * Unset the geometry on the mesh
   */
  remove: function () {
    this.system.unuseGeometry(this.data);
    this.el.getObject3D('mesh').geometry = dummyGeometry;
    this.geometry = null;
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
    if (!schema) { throw new Error('Unknown geometry schema `' + newGeometryType + '`'); }
    // Nothing has changed.
    if (currentGeometryType && currentGeometryType === newGeometryType) { return; }

    this.extendSchema(schema);
  }
});
