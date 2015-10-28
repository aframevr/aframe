/* global CustomEvent, Event */

/**
 * Fires a DOM event.
 *
 * @param {Element} el Element to fire the event on.
 * @param {String} name Name of the event.
 * @param {Object} detail Custom data to pass as `detail` if the event is a Custom Event.
 */
module.exports.fireEvent = function (el, name, detail) {
  var evt = detail ? new CustomEvent(name, { detail: detail }) : new Event(name);
  el.dispatchEvent(evt);
};

/**
 * Throws an error given a message.
 *
 * @param {String} msg Error message.
 */
module.exports.error = function (msg) {
  throw new Error(msg);
};

/**
 * Emits a console warning given passed message argument(s).
 */
module.exports.warn = function () {
  console.warn.apply(console, arguments);
};

/**
 * Emits a console log given passed message argument(s).
 */
module.exports.log = function () {
  console.log.apply(console, arguments);
};

/**
 * It mixes properties of source object into dest
 * @param  {object} dest   The object where properties will be copied TO
 * @param  {object} source The object where properties will be copied FROM
 */
module.exports.mixin = function (dest, source) {
  var keys;
  if (!source) { return dest; }
  keys = Object.keys(source);
  keys.forEach(mix);
  function mix (key) {
    dest[key] = source[key];
  }
  return dest;
};

/**
 * Given a coordinate in a string form "0 0 0"
 * It returns the coordinate parsed as an object
 * {x: 3, y: 4, z: -10}.
 *
 * @param  {string} value        String to parse.
 * @param  {object} default      contains the coordinate default values.
 * @return {object}              Parsed coordinate.
 */
module.exports.parseCoordinate = function (value, defaults) {
  defaults = defaults || {};
  if (typeof value !== 'string') { return value; }
  var values = value.split(' ');
  return {
    x: parseFloat(values[0] || defaults.x),
    y: parseFloat(values[1] || defaults.y),
    z: parseFloat(values[2] || defaults.z)
  };
};

/**
 * It coerces the strings of the obj object into the types of the schema object
 * In the case of a primitive value obj is coerced to the type of schema
 * @param  {} dest   The object that contains the string values to be coerced
 * @param  {} schema It contains the type or types
 */
module.exports.coerce = function (obj, schema) {
  var keys = Object.keys(obj);
  if (typeof obj !== 'object') { return coerceValue(obj, schema); }
  keys.forEach(coerce);
  return obj;
  function coerce (key) {
    var value = schema[key];
    var type = typeof value;
    if (value === undefined) { return; }
    obj[key] = coerceValue(obj[key], type);
  }
  function coerceValue (value, type) {
    if (typeof value !== 'string') { return value; }
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
      default:
        return value;
    }
  }
};

/**
 * Checks if a and b objects have the same attributes and the values
 * are equal. In the case of primitive types the values are compared directly
 * @param  {} a
 * @param  {} b
 * @return {boolean}   True if objects are equal. False otherwise
 */
module.exports.deepEqual = function (a, b) {
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  var i;
  if (keysA.length !== keysB.length) { return false; }
  // If there are no keys we just compare the objects
  if (keysA.length === 0) { return a === b; }
  for (i = 0; i < keysA.length; ++i) {
    if (a[keysA[i]] !== b[keysA[i]]) { return false; }
  }
  return true;
};
