var styleParser = require('style-attr');
var utils = require('../vr-utils');

/**
 * Component class definition.
 *
 * Components configure appearance, modify behavior, or add functionality to
 * entities. The behavior and appearance of an entity can be changed at runtime
 * by adding, removing, or updating components. Entities do not share instances
 * of components.
 *
 * @namespace Component
 * @property {object} data - Stores component data, populated by parsing the
 *           attribute name of the component plus applying defaults and mixins.
 * @property {object} el - Reference to the entity element.
 * @property {string} name - Name of the attribute the component is connected
             to..
 */
var Component = function (el) {
  this.el = el;
  this.data = {};
  this.parseAttributes();
  this.init();
  this.update();
};

Component.prototype = {
  /**
   * Contains default data values.
   * Data is coerced into the types of the values of the defaults.
   */
  defaults: {},

  /**
   * Component initialization which is run only once.
   * Use to set initial things up.
   */
  init: function () { /* no-op */ },

  /**
   * Called whenever component's data changes.
   * Note that this is also called on component initialization where the
   * component receives its initial data.
   */
  update: function () { /* no-op */ },

  /**
   * Called whenever component is completely removed. Use to clean up
   * component from the entity.
   */
  remove: function () { /* no-op */ },

  /**
   * Called when new data is coming from the entity (e.g., attributeChangedCb)
   * or from its mixins. Does some parsing and applying before updating the
   * component.
   * Does not update if data has not changed.
   */
  updateAttributes: function () {
    var prevData = extend({}, this.data);
    this.parseAttributes();
    if (utils.deepEqual(prevData, this.data)) { return; }
    this.update();
  },

  /**
   * Builds component data from the current state of the entity, ultimately
   * updating this.data.
   *
   * If the component was detached completely, set data to null.
   *
   * Precedence:
   * 1. Defaults data
   * 2. Mixin data.
   * 3. Attribute data.
   * Finally coerce the data to the types of the defaults.
   */
  parseAttributes: function () {
    var self = this;
    var data = {};
    var defaults = self.defaults;
    var el = self.el;
    var elData;
    var mixinEls = el.mixinEls;
    var name = self.name;

    // 1. Default values (lowest precendence).
    data = extend(data, defaults);

    // 2. Mixin values.
    mixinEls.forEach(applyMixin);
    function applyMixin (mixinEl) {
      var mixinData = mixinEl.getAttribute(name);
      data = extend(data, mixinData);
    }

    // 3. Attribute values (highest precendence).
    elData = el.getAttribute(name);
    data = extend(data, elData);

    // Coerce to the type of the defaults.
    this.data = utils.coerce(data, defaults);
  },

  /**
   * Returns a copy of data such that we don't expose the private this.data.
   *
   * @returns {object} data
   */
  getData: function () {
    var data = this.data;
    if (typeof data !== 'object') { return data; }
    return utils.mixin({}, data);
  },

  /**
   * Calls style parser on a component string.
   * camelCases keys for error-tolerance (`max-value` ~= `maxValue`).
   *
   * @returns {object}
   */
  parseAttributesString: function (attrs) {
    if (typeof attrs !== 'string') { return attrs; }
    return transformKeysToCamelCase(styleParser.parse(attrs));
  },

  stringifyAttributes: function (attrs) {
    if (typeof attrs !== 'object') { return attrs; }
    return styleParser.stringify(attrs);
  }
};

/**
 * Does object extending, applying data from source onto dest.
 *
 * @param dest - Destination object or value.
 * @param source - Source object or value
 * @return Overridden object or value.
 */
function extend (dest, source) {
  var isSourceObject = typeof source === 'object';
  if (source === null) { return dest; }
  if (!isSourceObject) {
    if (source === undefined) { return dest; }
    return source;
  }
  return utils.mixin(dest, source);
}

/**
 * Converts string from hyphen to camelCase.
 *
 * @param {string} str - String to camelCase.
 * @return {string} CamelCased string.
 */
function toCamelCase (str) {
  return str.replace(/-([a-z])/g, camelCase);
  function camelCase (g) { return g[1].toUpperCase(); }
}

/**
 * Converts object's keys from hyphens to camelCase (e.g., `max-value` to
 * `maxValue`).
 *
 * @param {object} obj - The object to camelCase keys.
 * @return {object} The object with keys camelCased.
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

module.exports = Component;
