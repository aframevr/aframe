/**
 * Automated mesh primitive registration.
 */
let getMeshMixin = require('../getMeshMixin');
let geometries = require('../../../core/geometry').geometries;
let geometryNames = require('../../../core/geometry').geometryNames;
let registerPrimitive = require('../primitives').registerPrimitive;
let utils = require('../../../utils/');

// For testing.
let meshPrimitives = module.exports = {};

// Generate primitive for each geometry type.
geometryNames.forEach(function registerMeshPrimitive (geometryName) {
  let geometry = geometries[geometryName];
  let geometryHyphened = unCamelCase(geometryName);

  // Generate mappings.
  let mappings = {};
  Object.keys(geometry.schema).forEach(function createMapping (property) {
    mappings[unCamelCase(property)] = 'geometry.' + property;
  });

  // Register.
  let tagName = 'a-' + geometryHyphened;
  let primitive = registerPrimitive(tagName, utils.extendDeep({}, getMeshMixin(), {
    defaultComponents: {geometry: {primitive: geometryName}},
    mappings: mappings
  }));
  meshPrimitives[tagName] = primitive;
});

/**
 * camelCase to hyphened-string.
 */
function unCamelCase (str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
