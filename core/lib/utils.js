var VRMarkup = require('@mozvr/vr-markup');
var VREvent = require('../vr-event/vr-event');
var nunjucks = require('nunjucks');

var registerElement = VRMarkup.registerElement.registerElement;

nunjucks.configure({autoescape: true});

/**
 * Wraps `querySelector` à la jQuery's `$`.
 *
 * @param {String|Element} sel CSS selector to match an element.
 * @param {Element=} parent Parent from which to query.
 * @returns {Element} Element matched by selector.
 */
module.exports.$ = function (sel, parent) {
  var el = sel;
  if (sel && typeof sel === 'string') {
    el = (parent || document).querySelector(sel);
  }
  return el;
};

/**
 * Wraps `querySelectorAll` à la jQuery's `$`.
 *
 * @param {String|Element} sel CSS selector to match elements.
 * @param {Element=} parent Parent from which to query.
 * @returns {Array} Array of elements matched by selector.
 */
module.exports.$$ = function (sel, parent) {
  if (Array.isArray(sel)) { return sel; }
  var els = sel;
  if (sel && typeof sel === 'string') {
    els = (parent || document).querySelectorAll(sel);
  }
  return toArray(els);
};

/**
 * Turns an array-like object into an array.
 *
 * @param {String|Element} obj CSS selector to match elements.
 * @param {Array|NamedNodeMap|NodeList|HTMLCollection} arr An array-like object.
 * @returns {Array} Array of elements matched by selector.
 */
var toArray = module.exports.toArray = function (obj) {
  if (Array.isArray(obj)) { return obj; }
  if (typeof obj === 'object' && typeof obj.length === 'number') {
    return Array.prototype.slice.call(obj);
  }
  return [obj];
};

/**
 * Wraps `Array.prototype.forEach`.
 *
 * @param {Object} arr An array-like object.
 * @returns {Array} A real array.
 */
var forEach = module.exports.forEach = function (arr, fn) {
  return Array.prototype.forEach.call(arr, fn);
};

/**
 * Merges attributes à la `Object.assign`.
 *
 * @param {...Object} els
 *   Array-like object (NodeMap, array, etc.) of
 *   parent elements from which to query.
 * @returns {Array} Array of merged attributes.
 */
module.exports.mergeAttrs = function () {
  var mergedAttrs = {};
  forEach(arguments, function (el) {
    forEach(el.attributes, function (attr) {
      // NOTE: We use `getAttribute` instead of `attr.value` so our wrapper
      // for coordinate objects gets used.
      mergedAttrs[attr.name] = el.getAttribute(attr.name);
    });
  });
  return mergedAttrs;
};

/**
 * Returns HTML compiled from Nunjucks template and data object.
 *
 * > format('my favourite color is {{ color }}', {color: blue})
 * "my favourite color is blue"
 *
 * @param {String} str Nunjucks template (or just plain old raw HTML).
 * @param {Object=} data Context variables to pass to template.
 * @returns {String} Formatted string with interpolated data.
 */
module.exports.format = function (str, data) {
  data = data || {};
  Object.keys(data).forEach(function (key) {
    data[String(key).toLowerCase()] = data[key];
  });
  return nunjucks.renderString(str, data);
};

/**
 * Wraps an element as a new one with a different name.
 *
 * @param {String} newTagName - Name of the new custom element.
 * @param {Element} srcElement - Original custom element to wrap.
 * @param {Object=} [data={}] - Data for the new prototype.
 * @returns {Array} Wrapped custom element.
 */
var wrapElement = module.exports.wrapElement = function (newTagName, srcElement, data) {
  data = data || {};
  return registerElement(newTagName, {
    prototype: Object.create(srcElement.prototype, data)
  });
};

/**
 * Wraps `<vr-event>` for a particular event `type`.
 *
 * @param {String} newTagName - Name of the new custom element.
 * @param {Element} eventName - Name of event type.
 * @param {Object=} [data={}] - Data for the new prototype.
 * @returns {Array} Wrapped custom element.
 */
module.exports.wrapVREventElement = function (newTagName, eventName, data) {
  data = data || {};
  data.type = {
    value: eventName,
    writable: window.debug
  };
  return wrapElement(newTagName, VREvent, data);
};

/**
 * Splits a string into an array based on a delimiter.
 *
 * @param   {string=} [str='']        Source string
 * @param   {string=} [delimiter=' '] Delimiter to use
 * @returns {array}                   Array of delimited strings
 */
module.exports.splitString = function (str, delimiter) {
  if (typeof delimiter === 'undefined') { delimiter = ' '; }
  // First collapse the whitespace (or whatever the delimiter is).
  var regex = new RegExp(delimiter, 'g');
  str = (str || '').replace(regex, delimiter);
  // Then split.
  return str.split(delimiter);
};
