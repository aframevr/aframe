var schema = require('./schema');

var processSchema = schema.process;
var geometries = module.exports.geometries = {};  // Registered geometries.
var geometryNames = module.exports.geometryNames = [];  // Names of registered geometries.
var THREE = require('../lib/three');

/**
 * Geometry class definition.
 *
 * Geometries extend the geometry component API to create and register geometry types.
 */
var Geometry = module.exports.Geometry = function () {};

Geometry.prototype = {
  /**
   * Contains the type schema and defaults for the data values.
   * Data is coerced into the types of the values of the defaults.
   */
  schema: {},

  /**
   * Init handler. Similar to attachedCallback.
   * Called during shader initialization and is only run once.
   */
  init: function (data) {
    this.geometry = new THREE.BufferGeometry();
    return this.geometry;
  },

  /**
   * Update handler. Similar to attributeChangedCallback.
   * Called whenever the associated geometry data changes.
   *
   * @param {object} data - New geometry data.
   */
  update: function (data) { /* no-op */ }
};

/**
 * Registers a geometry to A-Frame.
 *
 * @param {string} name - Geometry name.
 * @param {object} definition - Geometry property and methods.
 * @returns {object} Geometry.
 */
module.exports.registerGeometry = function (name, definition) {
  var NewGeometry;
  var proto = {};

  // Format definition object to prototype object.
  Object.keys(definition).forEach(function expandDefinition (key) {
    proto[key] = {
      value: definition[key],
      writable: true
    };
  });

  if (geometries[name]) {
    throw new Error('The geometry `' + name + '` has been already registered');
  }
  NewGeometry = function () { Geometry.call(this); };
  NewGeometry.prototype = Object.create(Geometry.prototype, proto);
  NewGeometry.prototype.name = name;
  NewGeometry.prototype.constructor = NewGeometry;
  geometries[name] = {
    Geometry: NewGeometry,
    schema: processSchema(NewGeometry.prototype.schema)
  };
  geometryNames.push(name);
  return NewGeometry;
};
