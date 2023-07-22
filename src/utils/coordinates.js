/* global THREE */
var debug = require('./debug');
var extend = require('object-assign');

var warn = debug('utils:coordinates:warn');

// Order of coordinates parsed by coordinates.parse.
var COORDINATE_KEYS = ['x', 'y', 'z', 'w'];

// Coordinate string regex. Handles negative, positive, and decimals.
var regex = /^\s*((-?\d*\.{0,1}\d+(e-?\d+)?)\s+){2,3}(-?\d*\.{0,1}\d+(e-?\d+)?)\s*$/;
module.exports.regex = regex;

var whitespaceRegex = /\s+/g;

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
  var defaultVal;
  var key;
  var i;
  var vec;
  var x;
  var y;
  var z;
  var w;

  if (value && value instanceof Object) {
    x = value.x === undefined ? defaultVec && defaultVec.x : value.x;
    y = value.y === undefined ? defaultVec && defaultVec.y : value.y;
    z = value.z === undefined ? defaultVec && defaultVec.z : value.z;
    w = value.w === undefined ? defaultVec && defaultVec.w : value.w;
    if (x !== undefined && x !== null) { value.x = parseIfString(x); }
    if (y !== undefined && y !== null) { value.y = parseIfString(y); }
    if (z !== undefined && z !== null) { value.z = parseIfString(z); }
    if (w !== undefined && w !== null) { value.w = parseIfString(w); }
    return value;
  }

  if (value === null || value === undefined) {
    return typeof defaultVec === 'object' ?   extend({}, defaultVec) : defaultVec;
  }

  coordinate = value.trim().split(whitespaceRegex);
  vec = {};
  for (i = 0; i < COORDINATE_KEYS.length; i++) {
    key = COORDINATE_KEYS[i];
    if (coordinate[i]) {
      vec[key] = parseFloat(coordinate[i], 10);
    } else {
      defaultVal = defaultVec && defaultVec[key];
      if (defaultVal === undefined) { continue; }
      vec[key] = parseIfString(defaultVal);
    }
  }
  return vec;
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
  var str;
  if (typeof data !== 'object') { return data; }
  str = data.x + ' ' + data.y;
  if (data.z != null) { str += ' ' + data.z; }
  if (data.w != null) { str += ' ' + data.w; }
  return str;
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

function parseIfString (val) {
  if (val !== null && val !== undefined && val.constructor === String) {
    return parseFloat(val, 10);
  }
  return val;
}

/**
 * Convert {x, y, z} object to three.js Vector3.
 */
module.exports.toVector3 = function (vec3) {
  return new THREE.Vector3(vec3.x, vec3.y, vec3.z);
};
