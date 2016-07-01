/**
 * Get component property using encoded component name + component property name with a
 * delimiter.
 */
module.exports.getComponentProperty = function (el, name, delimiter) {
  var splitName;
  delimiter = delimiter || '.';
  if (name.indexOf(delimiter) !== -1) {
    splitName = name.split(delimiter);
    return el.getComputedAttribute(splitName[0])[splitName[1]];
  }
  return el.getComputedAttribute(name);
};

/**
 * Set component property using encoded component name + component property name with a
 * delimiter.
 */
module.exports.setComponentProperty = function (el, name, value, delimiter) {
  var splitName;
  delimiter = delimiter || '.';
  if (name.indexOf(delimiter) !== -1) {
    splitName = name.split(delimiter);
    el.setAttribute(splitName[0], splitName[1], value);
    return;
  }
  el.setAttribute(name, value);
};
