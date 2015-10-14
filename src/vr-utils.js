/* global CustomEvent, Event */

/**
 * Fires a DOM event.
 *
 * @param {Element} el Element to fire the event on.
 * @param {String} name Name of the event.
 * @param {Object} detail Custom data to pass as `detail` if the event is a Custom Event.
 */
module.exports.fireEvent = function (el, name, detail) {
  el.dispatchEvent(detail ? new CustomEvent(name, detail) : new Event(name));
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
 * Emits a console warning given a message.
 *
 * @param {String} msg Warning message.
 */
module.exports.warn = function (msg) {
  console.warn(msg);
};

/**
 * Emits a console log given a message.
 *
 * @param {String} msg Log message.
 */
module.exports.log = function (msg) {
  console.log(msg);
};

/**
 * It mixes properties of source object into dest
 * @param  {object} dest   The object where properties will be copied TO
 * @param  {object} source The object where properties will be copied FROM
 */
module.exports.mixin = function (dest, source) {
  var keys = Object.keys(source);
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
 * @return {object}              Parsed coordinate.
 */
module.exports.parseCoordinate = function (value) {
  if (typeof value !== 'string') { return value; }
  var values = value.split(' ');
  return {
    x: parseFloat(values[0]),
    y: parseFloat(values[1]),
    z: parseFloat(values[2])
  };
};

/**
 * It coerces the strings of the obj object into the types of the schema object
 * @param  {object} dest   The object that contains the string values to be coerced
 * @param  {object} schema The object that contains the types
 */
module.exports.coerce = function (obj, schema) {
  var keys = Object.keys(obj);
  keys.forEach(coerce);
  function coerce (key) {
    var type;
    var value = schema[key];
    if (!value) { return; }
    type = typeof value;
    switch (type) {
      case 'string':
        return;
      case 'boolean':
        obj[key] = obj[key] === 'true';
        return;
      case 'number':
        obj[key] = parseFloat(obj[key]);
        return;
    }
  }
};
