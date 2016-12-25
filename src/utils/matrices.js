/* global THREE */

/**
 * Matrix formats
 *
 * End users handle matrix as row-major format while
 * it's handled as column-major format A-Frame/Three.js inside.
 *
 * parse: row-major format input and column-major format output
 * stringify: column-major format input and row-major format output
 */

var matrix3Regex = /^\s*(?:(-?\d*\.?\d+)\s+){8}(-?\d*\.?\d+)\s*$/;
var matrix4Regex = /^\s*(?:(-?\d*\.?\d+)\s+){15}(-?\d*\.?\d+)\s*$/;

/**
 * Parses column-major matrix3 array from an row-major space separated
 * strings.
 * Example: "0 1 2 3 4 5 6 7 8" to [0, 3, 6, 1, 4, 7, 2, 5, 8]
 *
 * @param {string} value - row-major matrix space separated strings
 * @param {array} defaultMatrix - row-major matrix array
 * @returns {array} column-major matrix array
 */
function parseMatrix3 (value, defaultMatrix) {
  return parse(value, defaultMatrix, 9);
}
module.exports.parseMatrix3 = parseMatrix3;

/**
 * Parses column-major matrix4 array from an row-major space separated
 * strings.
 * Example: "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15" to
 *          [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]
 *
 * @param {string} value - row-major matrix space separated strings
 * @param {array} defaultMatrix - row-major matrix array
 * @returns {array} column-major matrix array
 */
function parseMatrix4 (value, defaultMatrix) {
  return parse(value, defaultMatrix, 16);
}
module.exports.parseMatrix4 = parseMatrix4;

function parse (value, defaultMatrix, length) {
  var mat = [];
  var array;

  if (Array.isArray(value)) {
    array = value;
  } else if (typeof value === 'string') {
    array = value.split(/\s+/).map(function (str) { return str.trim(); });
  } else {
    return Array.isArray(defaultMatrix)
             ? transpose(matrixParseFloat(defaultMatrix)) : defaultMatrix;
  }

  for (var i = 0; i < length; i++) {
    mat[i] = i < array.length ? array[i] : defaultMatrix && defaultMatrix[i];
  }

  return transpose(matrixParseFloat(mat));
}

/**
 * Stringify row-major matrix from an column-major matrix array.
 * Example: [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15] to
 *          "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"
 *
 * @param {array|string}
 * @returns {string}
 */
function stringify (data) {
  if (!Array.isArray(data)) { return data; }
  return transpose(data).join(' ');
}
module.exports.stringify = stringify;

function isMatrix3 (value) {
  return matrix3Regex.test(value);
}
module.exports.isMatrix3 = isMatrix3;

function isMatrix4 (value) {
  return matrix4Regex.test(value);
}
module.exports.isMatrix4 = isMatrix4;

function matrixParseFloat (mat) {
  for (var i = 0, il = mat.length; i < il; i++) {
    mat[i] = parseFloat(mat[i], 10);
  }
  return mat;
}

/**
 * Transposes matrix array to switch row/column-major format.
 */
function transpose (matrix) {
  var result = [];
  var rowSize = Math.sqrt(matrix.length);

  for (var i = 0; i < matrix.length; i++) {
    result[i] = matrix[((i / rowSize) | 0) + ((i % rowSize) * rowSize)];
  }

  return result;
}

/**
 * Converts column-major matrix3 array to three.js Matrix3
 */
function toMatrix3 (mat3) {
  return (new THREE.Matrix3()).fromArray(mat3);
}
module.exports.toMatrix3 = toMatrix3;

/**
 * Converts column-major matrix4 array to three.js Matrix4
 */
function toMatrix4 (mat4) {
  return (new THREE.Matrix4()).fromArray(mat4);
}
module.exports.toMatrix4 = toMatrix4;
