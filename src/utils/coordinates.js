import * as THREE from 'three';
import debug from './debug.js';

var warn = debug('utils:coordinates:warn');

// Order of coordinates parsed by coordinates.parse.
var COORDINATE_KEYS = ['x', 'y', 'z', 'w'];

// Coordinate string regex. Handles negative, positive, and decimals.
export var regex = /^\s*((-?\d*\.{0,1}\d+(e-?\d+)?)\s+){2,3}(-?\d*\.{0,1}\d+(e-?\d+)?)\s*$/;

var whitespaceRegex = /\s+/g;

/**
 * Parses coordinates from an "x y z" string.
 * Example: "3 10 -5" to {x: 3, y: 10, z: -5}.
 *
 * @param {string} value - An "x y z" string.
 * @param {string} defaultVec - fallback value.
 * @param {object} target - Optional target object for coordinates.
 * @returns {object} An object with keys [x, y, z].
 */
export function parse (value, defaultVec, target) {
  var coordinate;
  var defaultVal;
  var key;
  var i;
  var vec = (target && typeof target === 'object') ? target : {};
  var x;
  var y;
  var z;
  var w;

  if (value && value instanceof Object) {
    x = value.x === undefined ? defaultVec && defaultVec.x : value.x;
    y = value.y === undefined ? defaultVec && defaultVec.y : value.y;
    z = value.z === undefined ? defaultVec && defaultVec.z : value.z;
    w = value.w === undefined ? defaultVec && defaultVec.w : value.w;
    if (x !== undefined && x !== null) { vec.x = parseIfString(x); }
    if (y !== undefined && y !== null) { vec.y = parseIfString(y); }
    if (z !== undefined && z !== null) { vec.z = parseIfString(z); }
    if (w !== undefined && w !== null) { vec.w = parseIfString(w); }
    return vec;
  }

  if (value === null || value === undefined) {
    return typeof defaultVec === 'object' ? Object.assign(vec, defaultVec) : defaultVec;
  }

  coordinate = value.trim().split(whitespaceRegex);
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

/**
 * Stringify coordinates from an object with keys [x y z].
 * Example: {x: 3, y: 10, z: -5} to "3 10 -5".
 *
 * @param {object|string} data - An object with keys [x y z].
 * @returns {string} An "x y z" string.
 */
export function stringify (data) {
  var str;
  if (typeof data !== 'object') { return data; }
  str = data.x + ' ' + data.y;
  if (data.z != null) { str += ' ' + data.z; }
  if (data.w != null) { str += ' ' + data.w; }
  return str;
}

/**
 * Compares the values of two coordinates to check equality.
 *
 * @param {object|string} a - An object with keys [x y z].
 * @param {object|string} b - An object with keys [x y z].
 * @returns {boolean} True if both coordinates are equal, false otherwise
 */
export function equals (a, b) {
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }
  return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isCoordinates (value) {
  return regex.test(value);
}

export function isCoordinate (value) {
  warn('`AFRAME.utils.isCoordinate` has been renamed to `AFRAME.utils.isCoordinates`');
  return isCoordinates(value);
}

function parseIfString (val) {
  if (val !== null && val !== undefined && val.constructor === String) {
    return parseFloat(val, 10);
  }
  return val;
}

/**
 * Convert {x, y, z} object to three.js Vector3.
 */
export function toVector3 (vec3) {
  return new THREE.Vector3(vec3.x, vec3.y, vec3.z);
}
