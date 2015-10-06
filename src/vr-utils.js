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
 * Returns the default value of an attribute based on its attribute name.
 *
 * @param {String} attr The name of the attribute (e.g., the string `'position'`).
 * @returns {Object} The default value of the attribute.
 */
var getDefaultValue = function (attr) {
  // Special casing for attributes whose values get transformed to objects.
  if (attr === 'position' || attr === 'rotation' || attr === 'to') {
    return {x: 0, y: 0, z: 0};
  }

  if (attr === 'scale') {
    return {x: 1, y: 1, z: 1};
  }
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

  var valueLower = (value || '').toLowerCase();
  var values = '';

  if (typeof defaultValue === 'undefined') {
    defaultValue = getDefaultValue(attr);
  }

  if (typeof defaultValue === 'object') {
    if ('x' in defaultValue && 'y' in defaultValue && 'z' in defaultValue) {
      if (!value) { return defaultValue; }

      values = value.split(' ');

      return {
        x: parseFloat(values[0] || defaultValue.x),
        y: parseFloat(values[1] || defaultValue.y),
        z: parseFloat(values[2] || defaultValue.z)
      };
    }
  }

  if (value === '' || value === null || typeof value === 'undefined') {
    return typeof defaultValue === 'undefined' ? null : defaultValue;
  }

  if (typeof defaultValue === 'number') {
    return parseFloat(value);
  }

  if (typeof defaultValue === 'boolean') {
    return valueLower === 'true';
  }

  return value;
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
 * It mixes properties of source object into dest
 * @param  {object} dest   The object where properties will be copied TO
 * @param  {object} source The object where properties will be copied FROM
 */
module.exports.isVRObject = function (dest, source) {
  var keys = Object.keys(source);
  keys.forEach(mix);
  function mix (key) {
    dest[key] = source[key];
  }
};
