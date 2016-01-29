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
function parse (value, defaultVec3) {
  var coordinate;

  if (value && typeof value === 'object') {
    return vec3ParseFloat(value);
  }

  if (typeof value !== 'string' || value === null) {
    return defaultVec3;
  }

  coordinate = value.trim().replace(/\s+/g, ' ').split(' ');
  return vec3ParseFloat({
    x: coordinate[0] || defaultVec3.x,
    y: coordinate[1] || defaultVec3.y,
    z: coordinate[2] || defaultVec3.z
  });
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

function vec3ParseFloat (vec3) {
  return {
    x: parseFloat(vec3.x, 10),
    y: parseFloat(vec3.y, 10),
    z: parseFloat(vec3.z, 10)
  };
}
