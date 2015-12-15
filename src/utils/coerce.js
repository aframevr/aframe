var coordinates = require('./coordinates');
var utils = require('./index');

/**
 * If `value` is object, coerce values of `val` into types defined by `schema`.
 * If `value` is string and `schemaAttr` defined, coerces `value` into the value in `schema`
 * pointed to by `schemaAttr`.
 *
 * @param {object|string} value - value(s) to coerce.
 * @param {object} schema - Object which values will be used to coerce to.
 * @param {string} schemaAttr -
 *   In case `value` is a string, `schemaAttr` signifies which value in `schema` to coerce to.
 * @returns Coerced value or object.
 */
module.exports = function (value, schema, schemaAttr) {
  var obj = value;

  // Batch coerce.
  if (typeof value === 'object') {
    Object.keys(obj).forEach(function (key) {
      var attrSchema = schema[key];
      var schemaValue;
      if (!attrSchema) {
        utils.warn('Unknown component attribute: ' + key);
        return;
      }
      schemaValue = attrSchema.default;
      if (schemaValue === undefined) { return; }
      obj[key] = coerceValue(obj[key], schemaValue);
    });
    return obj;
  }

  // Handle case: string.
  return coerceValue(value, schema.default);

  function coerceValue (value, targetValue) {
    if (typeof value !== 'string') { return value; }

    switch (typeof targetValue) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
      case 'object':
        if (utils.deepEqual(Object.keys(targetValue), ['x', 'y', 'z'])) {
          return coordinates.parse(value);
        }
        return value;
      default:
        return value;
    }
  }
};
