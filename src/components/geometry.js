var geometries = require('../core/geometry').geometries;
var geometryNames = require('../core/geometry').geometryNames;
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var dummyGeometry = new THREE.BufferGeometry();

/**
 * Geometry component. Combined with material component to make a mesh in 3D object.
 * Extended with registered geometries.
 */
module.exports.Component = registerComponent('geometry', {
  schema: {
    buffer: {default: true},
    primitive: {default: 'box', oneOf: geometryNames, schemaChange: true},
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
    var el = this.el;
    var mesh;
    var system = this.system;

    // Dispose old geometry if we created one.
    if (this.geometry) {
      system.unuseGeometry(previousData);
      this.geometry = null;
    }

    // Create new geometry.
    this.geometry = system.getOrCreateGeometry(data);

    // Set on mesh. If mesh does not exist, create it.
    mesh = el.getObject3D('mesh');
    if (mesh) {
      mesh.geometry = this.geometry;
    } else {
      mesh = new THREE.Mesh();
      mesh.geometry = this.geometry;
      // Default material if not defined on the entity.
      if (!this.el.getAttribute('material')) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: Math.random() * 0xFFFFFF,
          metalness: 0,
          roughness: 0.5
        });
      }
      el.setObject3D('mesh', mesh);
    }
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
   */
  updateSchema: function (data) {
    var currentGeometryType = this.oldData && this.oldData.primitive;
    var newGeometryType = data.primitive;
    var schema = geometries[newGeometryType] && geometries[newGeometryType].schema;

    // Geometry has no schema.
    if (!schema) { throw new Error('Unknown geometry schema `' + newGeometryType + '`'); }
    // Nothing has changed.
    if (currentGeometryType && currentGeometryType === newGeometryType) { return; }

    this.extendSchema(schema);
  }
});
