var styleParser = require('style-attr');
var utils = require('../vr-utils');

var Component = function (el) {
  this.el = el;
  // To store the component specific data
  this.data = {};
  this.parseAttributes();
  this.init();
  this.update();
};

/**
 * Given a source value or object it overrides the properties of
 * the destination argument
 * @param  {} dest   The destination object or value
 * @param  {} source The source object or value
 * @return {}        The overriden object or value
 */
var applyData = function (dest, source) {
  var isSourceObject = typeof source === 'object';
  if (source === null) { return dest; }
  if (!isSourceObject) {
    if (source === undefined) { return dest; }
    return source;
  }
  return utils.mixin(dest, source);
};

/**
 * Converts string from hyphen to camel case
 * @param  {string} str Input string to be converted
 * @return {string}     Camel cased string
 */
function toCamelCase (str) {
  return str.replace(/-([a-z])/g, camelCase);
  function camelCase (g) { return g[1].toUpperCase(); }
}

/**
 * Returns the same object but with the keys
 * converted from hyphen to camelCase e.g: max-value -> maxValue
 * @param  {object} obj The object wich keys will be camel cased
 * @return {object}     The object with the keys camel cased
 */
function transformKeysToCamelCase (obj) {
  var keys = Object.keys(obj);
  var camelCaseObj = {};
  keys.forEach(function (key) {
    var camelCaseKey = toCamelCase(key);
    camelCaseObj[camelCaseKey] = obj[key];
  });
  return camelCaseObj;
}

Component.prototype = {
  /**
   * Parses the data coming from the entity attribute
   * and its mixins and calls update
   */
  updateAttributes: function () {
    var previousData = applyData({}, this.data);
    this.parseAttributes();
    // Don't update if properties haven't changed
    if (utils.deepEqual(previousData, this.data)) { return; }
    this.update();
  },

  /**
   * Called on component initialization
   */
  init: function () { /* no-op */ },

  /**
   * It is called on the component
   * each time there's a change on the associated
   * data of the entity.
   */
  update: function () { /* no-op */ },

  /* Contains the data default values */
  defaults: {},

  /**
   * Parses the data coming from the entity attribute
   * If there are mixins its values will be mixed in
   * Defaults are mixed in first, followed by the mixins
   * and finally the entity attributes that have the highest
   * precedence. Lastly the values are coerced to the
   * types of the defaults
   *  @param  {object} [attrs] It contains the attribute values
   *  @return {undefined}
   */
  parseAttributes: function () {
    var data = {};
    var defaults = this.defaults;
    var el = this.el;
    var elAttrs = el.getAttribute(this.name);
    var self = this;
    var mixinEls = el.mixinEls;
    // Copy the defaults first. Lowest precedence
    data = applyData(data, defaults);
    // Copy mixin values
    mixinEls.forEach(applyMixin);
    function applyMixin (mixinEl) {
      var mixinData = mixinEl.getAttribute(self.name);
      data = applyData(data, mixinData);
    }
    // Copy attribute values. highest precedence
    data = applyData(data, elAttrs);
    // Coerce to the type of the defaults
    utils.coerce(data, defaults);
    this.data = data;
  },

  getData: function () {
    var data = this.data;
    // Primitive data type.
    if (typeof data !== 'object') { return data; }
    // Return a copy of data
    return utils.mixin({}, data);
  },

  parseAttributesString: function (attrs) {
    if (typeof attrs !== 'string') { return attrs; }
    // We camel case keys so for instance max-value is equivalent to maxValue
    return transformKeysToCamelCase(styleParser.parse(attrs));
  },

  stringifyAttributes: function (attrs) {
    if (typeof attrs !== 'object') { return attrs; }
    return styleParser.stringify(attrs);
  }
};

module.exports = Component;
