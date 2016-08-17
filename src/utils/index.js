/* global CustomEvent, location */
/* Centralized place to reference utilities since utils is exposed to the user. */

var deepAssign = require('deep-assign');
var objectAssign = require('object-assign');

module.exports.bind = require('./bind');
module.exports.coordinates = require('./coordinates');
module.exports.checkHeadsetConnected = require('./checkHeadsetConnected');
module.exports.debug = require('./debug');
module.exports.entity = require('./entity');
module.exports.forceCanvasResizeSafariMobile = require('./forceCanvasResizeSafariMobile');
module.exports.material = require('./material');
module.exports.styleParser = require('./styleParser');

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
 * Checks if browser is mobile.
 * @return {Boolean} True if mobile browser detected.
 */
module.exports.isMobile = function () {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      check = true;
    }
    if (isIOS()) {
      check = true;
    }
    if (isGearVR()) {
      check = false;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

var isIOS = module.exports.isIOS = function () {
  return /iPad|iPhone|iPod/.test(navigator.platform);
};

var isGearVR = module.exports.isGearVR = function () {
  return /SamsungBrowser.+Mobile VR/i.test(navigator.userAgent);
};

/**
 * Checks mobile device orientation.
 * @return {Boolean} True if landscape orientation.
 */
module.exports.isLandscape = function () {
  return window.orientation === 90 || window.orientation === -90;
};

/**
 * Returns whether we should capture this keyboard event for keyboard shortcuts.
 * @param {Event} event Event object.
 * @returns {Boolean} Whether the key event should be captured.
 */
module.exports.shouldCaptureKeyEvent = function (event) {
  if (event.shiftKey || event.metaKey || event.altKey || event.ctrlKey) {
    return false;
  }
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
