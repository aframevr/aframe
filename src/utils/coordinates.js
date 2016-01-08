// Coordinate string regex. Handles negative, positive, and decimals.
var regex = /\s*(-?\d*\.{0,1}\d+)\s*(-?\d*\.{0,1}\d+)\s*(-?\d*\.{0,1}\d+)\s*/;
module.exports.regex = regex;

/**
 * Parses coordinates from an "x y z" string.
 * Example: "3 10 -5" to {x: 3, y: 10, z: -5}.
 *
 * @param {string} val - An "x y z" string.
 * @param {string} defaults - fallback value.
 * @returns {object} An object with keys [x, y, z].
 */
function parse (value, schema) {
  var coordinate;
  schema = schema || {};
  if (typeof value !== 'string' || value === null) { return value; }
  coordinate = value.trim().replace(/\s+/g, ' ').split(' ');
  return {
    x: parseFloat(coordinate[0] || schema.x.default),
    y: parseFloat(coordinate[1] || schema.y.default),
    z: parseFloat(coordinate[2] || schema.z.default)
  };
}
module.exports.parse = parse;

/**
 * Stringifies coordinates from an object with keys [x y z].
 * Example: {x: 3, y: 10, z: -5} to "3 10 -5".
 *
 * @param {object|string} val - An object with keys [x y z].
 * @returns {string} An "x y z" string.
 */
function stringify (value) {
  if (typeof value !== 'object') { return value; }
  return [value.x, value.y, value.z].join(' ');
}
module.exports.stringify = stringify;

/**
 * @returns {bool}
 */
module.exports.isCoordinate = function (value) {
  return regex.test(value);
};

/**
 * Prototype mixin for coordinate-only components.
 */
module.exports.componentMixin = {
  parse: function (value) {
    return parse(value, this.schema);
  },

  stringify: stringify
};
