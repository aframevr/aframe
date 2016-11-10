/**
 * Split a delimited component property string (e.g., `material.color`) to an object
 * containing `component` name and `property` name. If there is no delimiter, just return the
 * string back.
 */
module.exports.getComponentPropertyPath = function (str, delimiter) {
  delimiter = delimiter || '.';
  if (str.indexOf(delimiter) === -1) { return str; }
  return str.split(delimiter);
};

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
