/* Utils for parsing style-like strings (e.g., "primitive: box; width: 5; height: 4.5"). */
var styleParser = require('style-attr');

/**
 * Deserializes style-like string into an object of properties.
 *
 * @param {string} value - HTML attribute value.
 * @returns {object} Property data.
 */
module.exports.parse = function (value) {
  var parsedData;
  if (typeof value !== 'string') { return value; }
  parsedData = styleParser.parse(value);
  // The style parser returns an object { "" : "test"} when fed a string
  if (parsedData['']) { return value; }
  return transformKeysToCamelCase(parsedData);
};

/**
 * Serialize an object of properties into a style-like string.
 *
 * @param {object} data - Property data.
 * @returns {string}
 */
module.exports.stringify = function (data) {
  if (typeof data === 'string') { return data; }
  return styleParser.stringify(data);
};

/**
 * Converts string from hyphen to camelCase.
 *
 * @param {string} str - String to camelCase.
 * @return {string} CamelCased string.
 */
function toCamelCase (str) {
  return str.replace(/-([a-z])/g, camelCase);
  function camelCase (g) { return g[1].toUpperCase(); }
}
module.exports.toCamelCase = toCamelCase;

/**
 * Converts object's keys from hyphens to camelCase (e.g., `max-value` to
 * `maxValue`).
 *
 * @param {object} obj - The object to camelCase keys.
 * @return {object} The object with keys camelCased.
 */
function transformKeysToCamelCase (obj) {
  var keys = Object.keys(obj);
  var camelCaseObj = {};
  keys.forEach(function (key) {
    var camelCaseKey = toCamelCase(key);
    camelCaseObj[camelCaseKey] = obj[key];
  });
  return camelCaseObj;
}
module.exports.transformKeysToCamelCase = transformKeysToCamelCase;
