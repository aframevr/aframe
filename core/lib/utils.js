/**
 * Wraps `querySelector` à la jQuery's `$`.
 *
 * @param {String|Element} sel CSS selector to match an element.
 * @param {Element=} parent Parent from which to query.
 * @returns {Element} Element matched by selector.
 */
module.exports.$ = function (sel, parent) {
  if (sel && typeof sel === 'string') {
    sel = (parent || document).querySelector(sel);
  }
  return sel;
};

/**
 * Wraps `querySelectorAll` à la jQuery's `$`.
 *
 * @param {String|Element} sel CSS selector to match elements.
 * @param {Element=} parent Parent from which to query.
 * @returns {Array} Array of elements matched by selector.
 */
module.exports.$$ = function (sel, parent) {
  if (sel && typeof sel === 'string') {
    sel = (parent || document).querySelectorAll(sel);
  }
  if (Array.isArray(sel)) {
    return sel;
  }
  return Array.prototype.slice.call(sel);
};

/**
 * Wraps `Array.prototype.forEach`.
 *
 * @param {Array|NamedNodeMap|NodeList|HTMLCollection} arr An array-like object.
 * @returns {Array} A real array.
 */
var forEach = module.exports.forEach = function (arr, fn) {
  return Array.prototype.forEach.call(arr, fn);
};

/**
 * Merges attributes à la `Object.assign`.
 *
 * @param {...Array|NamedNodeMap} attrs Parent from which to query.
 * @returns {Array} Array of merged attributes.
 */
module.exports.mergeAttrs = function () {
  var mergedAttrs = {};
  forEach(arguments, function (attrs) {
    forEach(attrs, function (attr) {
      mergedAttrs[attr.name] = attr.value;
    });
  });
  return mergedAttrs;
};

/**
 * Does ES6-style (or mustache-style) string formatting.
 *
 * > format('${0}', ['zzz'])
 * "zzz"
 *
 * > format('${0}{1}', 1, 2)
 * "12"
 *
 * > format('${x}', {x: 1})
 * "1"
 *
 * > format('my favourite color is ${color=blue}', {x: 1})
 * "my favourite color is blue"
 *
 * @returns {String} Formatted string with interpolated variables.
 */
module.exports.format = (function () {
  var re = /\$?\{\s*([^}= ]+)(\s*=\s*(.+))?\s*\}/g;
  return function (s, args) {
    if (!s) { throw new Error('Format string is empty!'); }
    if (!args) { return; }
    if (!(args instanceof Array || args instanceof Object)) {
      args = Array.prototype.slice.call(arguments, 1);
    }
    return s.replace(re, function (_, name, rhs, defaultVal) {
      var val = args[name];

      if (typeof val === 'undefined') {
        return (defaultVal || '?').trim().replace(/^["']|["']$/g, '');
      }

      return (val || '?').trim().replace(/^["']|["']$/g, '');
    });
  };
})();
