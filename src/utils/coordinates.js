/* global THREE */
var debug = require('./debug');
var extend = require('object-assign');

var warn = debug('utils:coordinates:warn');

// Order of coordinates parsed by coordinates.parse.
var COORDINATE_KEYS = ['x', 'y', 'z', 'w'];

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
    var x = value.x === undefined ? defaultVec && defaultVec.x : value.x;
    var y = value.y === undefined ? defaultVec && defaultVec.y : value.y;
    var z = value.z === undefined ? defaultVec && defaultVec.z : value.z;
    var w = value.w === undefined ? defaultVec && defaultVec.w : value.w;
    if (x !== undefined) value.x = parseIfString(x);
    if (y !== undefined) value.y = parseIfString(y);
    if (z !== undefined) value.z = parseIfString(z);
    if (w !== undefined) value.w = parseIfString(w);
    return value;
  }

  if (value === null || value === undefined) {
    return typeof defaultVec === 'object' ? extend({}, defaultVec) : defaultVec;
  }

  coordinate = value.trim().split(/\s+/g);

  vec = {};
  COORDINATE_KEYS.forEach(function (key, i) {
    if (coordinate[i] !== undefined) {
      vec[key] = parseFloat(coordinate[i], 10);
    } else {
      var defaultVal = defaultVec && defaultVec[key];
      if (defaultVal === undefined) { return; }
      vec[key] = parseIfString(defaultVal);
    }
  });
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

function parseIfString (val) {
  if (val.constructor === String) {
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
