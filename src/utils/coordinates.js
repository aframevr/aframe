/* global THREE */
var extend = require('object-assign');
// Coordinate string regex. Handles negative, positive, and decimals.
var regex = /^\s*((-?\d*\.{0,1}\d+(e-?\d+)?)\s+){2,3}(-?\d*\.{0,1}\d+(e-?\d+)?)\s*$/;
module.exports.regex = regex;

/**
 * Parses coordinates from an "x y z" string.
 * Example: "3 10 -5" to {x: 3, y: 10, z: -5}.
 *
 * @param {string} val - An "x y z" string.
 * @param {string} defaults - fallback value.
 * @returns {object} An object with keys [x, y, z].
 */
function parse (value, defaultVec) {
  var coordinate;
  var vec = {};

  if (value && typeof value === 'object') {
    return vecParseFloat({
      x: value.x !== undefined ? value.x : (defaultVec && defaultVec.x),
      y: value.y !== undefined ? value.y : (defaultVec && defaultVec.y),
      z: value.z !== undefined ? value.z : (defaultVec && defaultVec.z),
      w: value.w !== undefined ? value.w : (defaultVec && defaultVec.w)
    });
  }

  if (typeof value !== 'string' || value === null) {
    return typeof defaultVec === 'object' ? extend({}, defaultVec) : defaultVec;
  }

  coordinate = value.trim().replace(/\s+/g, ' ').split(' ');
  vec.x = coordinate[0] || defaultVec && defaultVec.x;
  vec.y = coordinate[1] || defaultVec && defaultVec.y;
  vec.z = coordinate[2] || defaultVec && defaultVec.z;
  vec.w = coordinate[3] || defaultVec && defaultVec.w;
  return vecParseFloat(vec);
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
  return [data.x, data.y, data.z, data.w].join(' ').trim();
}
module.exports.stringify = stringify;

/**
 * @returns {bool}
 */
module.exports.isCoordinates = function (value) {
  return regex.test(value);
};

function vecParseFloat (vec) {
  Object.keys(vec).forEach(function (key) {
    if (vec[key] === undefined) {
      delete vec[key];
      return;
    }
    vec[key] = parseFloat(vec[key], 10);
  });
  return vec;
}

/**
 * Converts {x, y, z} object to three.js Vector3.
 */
module.exports.toVector3 = function (vec3) {
  return new THREE.Vector3(vec3.x, vec3.y, vec3.z);
};
