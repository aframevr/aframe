/* global THREE */
var debug = require('./debug');
var extend = require('object-assign');

var warn = debug('utils:coordinates:warn');

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
  var vec;

  if (value && value instanceof Object) {
    if (defaultVec) {
      value.x = value.x === undefined ? defaultVec.x : value.x;
      value.y = value.y === undefined ? defaultVec.y : value.y;
      value.z = value.z === undefined ? defaultVec.z : value.z;
      value.w = value.w === undefined ? defaultVec.w : value.w;
    }
    return vecParseFloat(value);
  }

  if (value === null || value === undefined) {
    return typeof defaultVec === 'object' ? extend({}, defaultVec) : defaultVec;
  }

  coordinate = value.trim().replace(/\s+/g, ' ').split(' ');
  vec = {};
  vec.x = coordinate[0] || defaultVec && defaultVec.x;
  vec.y = coordinate[1] || defaultVec && defaultVec.y;
  vec.z = coordinate[2] || defaultVec && defaultVec.z;
  vec.w = coordinate[3] || defaultVec && defaultVec.w;
  return vecParseFloat(vec);
}
module.exports.parse = parse;

/**
 * Stringify coordinates from an object with keys [x y z].
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
function isCoordinates (value) {
  return regex.test(value);
}
module.exports.isCoordinates = isCoordinates;

module.exports.isCoordinate = function (value) {
  warn('`AFRAME.utils.isCoordinate` has been renamed to `AFRAME.utils.isCoordinates`');
  return isCoordinates(value);
};

function vecParseFloat (vec) {
  var key;
  for (key in vec) {
    if (vec[key] === undefined) {
      delete vec[key];
      continue;
    }
    if (vec[key].constructor === String) {
      vec[key] = parseFloat(vec[key], 10);
    }
  }
  return vec;
}

/**
 * Convert {x, y, z} object to three.js Vector3.
 */
module.exports.toVector3 = function (vec3) {
  return new THREE.Vector3(vec3.x, vec3.y, vec3.z);
};
