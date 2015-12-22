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
function parse (value, defaultCoordinate) {
  var coordinate;

  if (value && typeof value === 'object') { return value; }

  if (!defaultCoordinate && this.schema) {
    if ('default' in this.schema) {
      defaultCoordinate = this.schema.default;
    } else {
      defaultCoordinate = this.schema;
    }
  }

  if (typeof value !== 'string' || value === null) {
    return defaultCoordinate;
  }

  coordinate = value.trim().replace(/\s+/g, ' ').split(' ');
  return {
    x: parseFloat(coordinate[0] || defaultCoordinate.x),
    y: parseFloat(coordinate[1] || defaultCoordinate.y),
    z: parseFloat(coordinate[2] || defaultCoordinate.z)
  };
}
module.exports.parse = parse;

/**
 * Stringifies coordinates from an object with keys [x y z].
 * Example: {x: 3, y: 10, z: -5} to "3 10 -5".
 *
 * @param {object|string} data - An object with keys [x y z].
 * @returns {string} An "x y z" string.
 */
function stringify (data) {
  if (typeof data !== 'object') { return data; }
  return [data.x, data.y, data.z].join(' ');
}
module.exports.stringify = stringify;

/**
 * @returns {bool}
 */
module.exports.isCoordinate = function (value) {
  return regex.test(value);
};
