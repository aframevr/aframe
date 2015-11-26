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
  // Handle case: object.
  var obj = value;
  if (typeof value === 'object') {
    Object.keys(obj).forEach(function (key) {
      var schemaValue = schema[key];
      if (schemaValue === undefined) { return; }
      obj[key] = coerceValue(obj[key], typeof schemaValue);
    });
    return obj;
  }

  // Handle case: string.
  return coerceValue(value, typeof schema[schemaAttr]);

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
