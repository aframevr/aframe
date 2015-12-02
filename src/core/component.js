var debug = require('../utils/debug');
var styleParser = require('style-attr');
var utils = require('../utils/');

var components = module.exports.components = {};  // Keep track of registered components.
var error = debug('core:register-component:error');

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
 *           to.
 * @member {Element} el
 * @member {object} data
 * @member {function} getData
 * @member {function} init
 * @member {function} update
 * @member {function} remove
 * @member {function} parse
 * @member {function} stringify
 */
var Component = module.exports.Component = function (el) {
  var attrs = el.getAttribute(this.name);
  this.el = el;
  this.data = {};
  this.parseAttributes(attrs);
  this.init();
  this.update();
};

Component.prototype = {
  /**
   * Contains the type schema and defaults for the data values.
   * Data is coerced into the types of the values of the defaults.
   */
  schema: {},

  /**
   * Init handler. Similar to attachedCallback.
   * Called during component initialization and is only run once.
   * Components can use this to set initial state.
   */
  init: function () { /* no-op */ },

  /**
   * Update handler. Similar to attributeChangedCallback.
   * Called whenever component's data changes.
   * Also called on component initialization when the component receives initial data.
   *
   * @param {object} previousData - Previous attributes of the component.
   */
  update: function (previousData) { /* no-op */ },

  /**
   * Remove handler. Similar to detachedCallback.
   * Called whenever component is removed from the entity (i.e., removeAttribute).
   * Components can use this to reset behavior on the entity.
   */
  remove: function () { /* no-op */ },

  /**
   * Describes how the component should deserialize HTML attribute into data.
   * Can be overridden by the component.
   *
   * The default parsing is parsing style-like strings, camelCasing keys for
   * error-tolerance (`max-value` ~= `maxValue`).
   *
   * @param {string} value - HTML attribute.
   * @returns {object} Data.
   */
  parse: function (value) {
    if (typeof value !== 'string') { return value; }
    return transformKeysToCamelCase(styleParser.parse(value));
  },

  /**
   * Describes how the component should serialize data to a string to update the DOM.
   * Can be overridden by the component.
   *
   * The default stringify is to a style-like string.
   *
   * @param {object} data
   * @returns {string}
   */
  stringify: function (data) {
    if (typeof data !== 'object') { return data; }
    return styleParser.stringify(data);
  },

  /**
   * Returns a copy of data such that we don't expose the private this.data.
   *
   * @returns {object} data
   */
  getData: function () {
    var data = this.data;
    if (typeof data !== 'object') { return data; }
    return utils.extend({}, data);
  },

  /**
   * Called when new data is coming from the entity (e.g., attributeChangedCb)
   * or from its mixins. Does some parsing and applying before updating the
   * component.
   * Does not update if data has not changed.
   */
  updateAttributes: function (newData) {
    var previousData = extendWithCheck({}, this.data);
    this.parseAttributes(newData);
    // Don't update if properties haven't changed
    if (utils.deepEqual(previousData, this.data)) { return; }
    this.update(previousData);
    this.el.emit('componentchanged', {
      name: this.name,
      newData: this.getData(),
      oldData: previousData
    });
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
  parseAttributes: function (newData) {
    var self = this;
    var data = {};
    var schema = self.schema;
    var el = self.el;
    var mixinEls = el.mixinEls;
    var name = self.name;

    // 1. Default values (lowest precendence).
    Object.keys(schema).forEach(applyDefault);
    function applyDefault (key) {
      data[key] = schema[key].default;
    }

    // 2. Mixin values.
    mixinEls.forEach(applyMixin);
    function applyMixin (mixinEl) {
      var mixinData = mixinEl.getAttribute(name);
      data = extendWithCheck(data, mixinData);
    }

    // 3. Attribute values (highest precendence).
    data = extendWithCheck(data, newData);

    // Coerce to the type of the defaults.
    this.data = utils.coerce(data, schema);
  }
};

/**
 * Registers a component to A-Frame.
 *
 * @param {string} name - Component name.
 * @param {object} definition - Component property and methods.
 * @returns {object} Component.
 */
module.exports.registerComponent = function (name, definition) {
  var NewComponent;
  var proto = {};

  // Format definition object to prototype object.
  Object.keys(definition).forEach(function (key) {
    proto[key] = {
      value: definition[key],
      writable: window.debug
    };
  });

  if (components[name]) {
    error('The component "' + name + '" has been already registered');
  }
  NewComponent = function (el) {
    Component.call(this, el);
  };
  NewComponent.prototype = Object.create(Component.prototype, proto);
  NewComponent.prototype.name = name;
  NewComponent.prototype.constructor = NewComponent;
  components[name] = {
    Component: NewComponent,
    dependencies: NewComponent.prototype.dependencies,
    parse: NewComponent.prototype.parse.bind(NewComponent.prototype),
    schema: NewComponent.prototype.schema,
    stringify: NewComponent.prototype.stringify.bind(NewComponent.prototype)
  };
  return NewComponent;
};

/**
* Object extending, but checks if `source` is an object first.
* If not, `source` is a primitive and we don't do any extending.
*
* @param dest - Destination object or value.
* @param source - Source object or value
* @returns Overridden object or value.
*/
function extendWithCheck (dest, source) {
  var isSourceObject = typeof source === 'object';
  if (source === null) { return dest; }
  if (!isSourceObject) {
    if (source === undefined) { return dest; }
    return source;
  }
  return utils.extend(dest, source);
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
