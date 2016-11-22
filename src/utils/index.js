/* global CustomEvent, location */
/* Centralized place to reference utilities since utils is exposed to the user. */
var debug = require('./debug');
var deepAssign = require('deep-assign');
var device = require('./device');
var objectAssign = require('object-assign');

var warn = debug('utils:warn');

module.exports.bind = require('./bind');
module.exports.coordinates = require('./coordinates');
module.exports.debug = debug;
module.exports.device = device;
module.exports.entity = require('./entity');
module.exports.forceCanvasResizeSafariMobile = require('./forceCanvasResizeSafariMobile');
module.exports.material = require('./material');
module.exports.styleParser = require('./styleParser');
module.exports.trackedControls = require('./tracked-controls');

module.exports.checkHeadsetConnected = function () {
  warn('`utils.checkHeadsetConnected` has moved to `utils.device.checkHeadsetConnected`');
  return device.checkHeadsetConnected(arguments);
};
module.exports.isGearVR = function () {
  warn('`utils.isGearVR` has moved to `utils.device.isGearVR`');
  return device.isGearVR(arguments);
};
module.exports.isIOS = function () {
  warn('`utils.isIOS` has moved to `utils.device.isIOS`');
  return device.isIOS(arguments);
};
module.exports.isMobile = function () {
  warn('`utils.isMobile has moved to `utils.device.isMobile`');
  return device.isMobile(arguments);
};

/**
 * Fires a custom DOM event.
 *
 * @param {Element} el Element on which to fire the event.
 * @param {String} name Name of the event.
 * @param {Object=} [data={bubbles: true, {detail: <el>}}]
 *   Data to pass as `customEventInit` to the event.
 */
module.exports.fireEvent = function (el, name, data) {
  data = data || {};
  data.detail = data.detail || {};
  data.detail.target = data.detail.target || el;
  var evt = new CustomEvent(name, data);
  el.dispatchEvent(evt);
};

/**
 * Mix the properties of source object(s) into a destination object.
 *
 * @param  {object} dest - The object to which properties will be copied.
 * @param  {...object} source - The object(s) from which properties will be copied.
 */
module.exports.extend = objectAssign;
module.exports.extendDeep = deepAssign;

module.exports.clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Checks if two objects have the same attributes and values, including nested objects.
 *
 * @param {object} a - First object.
 * @param {object} b - Second object.
 * @returns {boolean} Whether two objects are deeply equal.
 */
function deepEqual (a, b) {
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  var i;
  if (keysA.length !== keysB.length) { return false; }
  // If there are no keys, compare the objects.
  if (keysA.length === 0) { return a === b; }
  for (i = 0; i < keysA.length; ++i) {
    if (a[keysA[i]] !== b[keysA[i]]) { return false; }
  }
  return true;
}
module.exports.deepEqual = deepEqual;

/**
 * Computes the difference between two objects.
 *
 * @param {object} a - First object to compare (e.g., oldData).
 * @param {object} b - Second object to compare (e.g., newData).
 * @returns {object}
 *   Difference object where set of keys note which values were not equal, and values are
 *   `b`'s values.
 */
module.exports.diff = function (a, b) {
  var diff = {};
  var keys = Object.keys(a);
  Object.keys(b).forEach(function collectKeys (bKey) {
    if (keys.indexOf(bKey) === -1) {
      keys.push(bKey);
    }
  });
  keys.forEach(function doDiff (key) {
    var aVal = a[key];
    var bVal = b[key];
    var isComparingObjects = aVal && bVal &&
                             aVal.constructor === Object && bVal.constructor === Object;
    if ((isComparingObjects && !deepEqual(aVal, bVal)) ||
        (!isComparingObjects && aVal !== bVal)) {
      diff[key] = bVal;
    }
  });
  return diff;
};

/**
 * Returns whether we should capture this keyboard event for keyboard shortcuts.
 * @param {Event} event Event object.
 * @returns {Boolean} Whether the key event should be captured.
 */
module.exports.shouldCaptureKeyEvent = function (event) {
  if (event.metaKey) { return false; }
  return document.activeElement === document.body;
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

/**
 * Extracts data from the element given an object that contains expected keys.
 *
 * @param {Element} Source element.
 * @param {Object} [defaults={}] Object of default key-value pairs.
 * @returns {Object}
 */
module.exports.getElData = function (el, defaults) {
  defaults = defaults || {};
  var data = {};
  Object.keys(defaults).forEach(copyAttribute);
  function copyAttribute (key) {
    if (el.hasAttribute(key)) {
      data[key] = el.getAttribute(key);
    }
  }
  return data;
};

/**
 * Retrieves querystring value.
 * @param  {String} name Name of querystring key.
 * @return {String}      Value
 */
module.exports.getUrlParameter = function (name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

/**
 * Detects whether context is within iframe.
 */
module.exports.isIframed = function () {
  return window.top !== window.self;
};

/**
 * Finds all elements under the element that have the isScene
 * property set to true
 */
module.exports.findAllScenes = function (el) {
  var matchingElements = [];
  var allElements = el.getElementsByTagName('*');
  for (var i = 0, n = allElements.length; i < n; i++) {
    if (allElements[i].isScene) {
      // Element exists with isScene set.
      matchingElements.push(allElements[i]);
    }
  }
  return matchingElements;
};

// Must be at bottom to avoid circular dependency.
module.exports.srcLoader = require('./src-loader');
