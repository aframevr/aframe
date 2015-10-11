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
 * Returns the default value of an attribute based on its attribute name.
 *
 * @param {String} attr The name of the attribute (e.g., the string `'position'`).
 * @returns {Object|null} The default value of the attribute.
 */
var getDefaultValue = function (attr) {
  // Special casing for attributes whose values get transformed to objects.
  if (attr === 'position' || attr === 'rotation' || attr === 'to') {
    return {x: 0, y: 0, z: 0};
  }

  if (attr === 'scale') {
    return {x: 1, y: 1, z: 1};
  }

  return null;
};

/**
 * Given a coordinate in a string form "0 0 0"
 * It returns the coordinate parsed as an object
 * {x: 3, y: 4, z: -10} or the default value.
 *
 * @param  {String} value        String to parse.
 * @param  {Object} defaultValue Default value.
 * @return {Object}              Parsed coordinate.
 */
var parseCoordinate = module.exports.parseCoordinate =
function (value, defaultValue) {
  var def;
  var values = '';
  if (typeof value !== 'string') { return defaultValue; }
  if (defaultValue === null) { return value; }
  if (typeof defaultValue === 'object') {
    if ('x' in defaultValue && 'y' in defaultValue && 'z' in defaultValue) {
      def = defaultValue;
    }
  }
  def = def || {x: 0, y: 0, z: 0};
  values = value.split(' ');
  return {
    x: parseFloat(values[0] || defaultValue.x),
    y: parseFloat(values[1] || defaultValue.y),
    z: parseFloat(values[2] || defaultValue.z)
  };
};

/**
 * Parse and transform an attribute value from its original string value.
 *
 * @param {String} attr The name of the attribute (e.g., the string `loop` for `loop="true"`).
 * @param {String} value The value of the attribute (e.g., the string `'true'` for `loop="true"`).
 * @param {(Boolean|Number|String|Object)} defaultValue The value to use if the attribute was missing or its value was empty (e.g., the boolean `false`).
 * @returns {(Boolean|Number|String|Object)} The parsed and coerced value of the attribute (e.g., the boolean `true` for `loop="true"`).
 */
module.exports.parseAttributeString = function (attr, value, defaultValue) {
  if (!attr) { return; }

  var valueLower = typeof value === 'string' ? value.toLowerCase() : value;
  // Internal default value (for position, rotation, scale...)
  var internalDefault = getDefaultValue(attr);
  defaultValue = defaultValue !== undefined ? defaultValue : internalDefault;
  // Type inference logic
  // If there's not a passed default value we fall back
  // to the internal default value type.
  var type = typeof defaultValue;

  switch (type) {
    case 'object':
      return parseCoordinate(value, defaultValue);
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return valueLower === 'true';
    default:
      return value !== undefined ? value : defaultValue;
  }
};

/**
 * Transform and stringify an attribute value to a string based on its original value.
 *
 * @param {(Boolean|Number|String|Object)} value The value of the attribute (e.g., `{x: 5, y: 10, z: 15}` in `setAttribute('position', {x: 5, y: 10, z: 15})`).
 * @returns {String} The transformed and stringified value of the attribute (e.g., `5 10 15` for `position="5 10 15"`).
 */
module.exports.stringifyAttributeValue = function (value) {
  if (typeof value === 'object') {
    if ('x' in value && 'y' in value && 'z' in value) {
      return [value.x, value.y, value.z].join(' ');
    }

    return JSON.stringify(value);
  }

  return String(value);
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
