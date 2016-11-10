/**
 * Get component property using encoded component name + component property name with a
 * delimiter.
 */
module.exports.getComponentProperty = function (el, name, delimiter) {
  var splitName;
  delimiter = delimiter || '.';
  if (name.indexOf(delimiter) !== -1) {
    splitName = name.split(delimiter);
    return el.getAttribute(splitName[0])[splitName[1]];
  }
  return el.getAttribute(name);
};

/**
 * Convert an encoded component + component property name, encoded with a delimiter, to a path in
 * array syntax.
 */
var getComponentPropertyPath = module.exports.getComponentPropertyPath = function (name, delimiter) {
  delimiter = delimiter || '.';
  return name.split(delimiter);
};

/**
 * Set component property using encoded component name + component property name with a
 * delimiter.
 */
module.exports.setComponentProperty = function (el, name, value, delimiter) {
  var propertyPath = getComponentPropertyPath(name, delimiter);
  if (propertyPath.length === 1) {
    el.setAttribute(propertyPath[1], value);
  } else if (propertyPath.length === 2) {
    el.setAttribute(propertyPath[0], propertyPath[1], value);
  } else {
    throw new Error('Invalid property name: "%s"', name);
  }
};
