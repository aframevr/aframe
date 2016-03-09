/* global HTMLElement */
var schema = require('./schema');
var styleParser = require('style-attr');
var systems = require('./system');
var utils = require('../utils/');

var parseProperties = schema.parseProperties;
var parseProperty = schema.parseProperty;
var processSchema = schema.process;
var isSingleProp = schema.isSingleProperty;
var stringifyProperties = schema.stringifyProperties;
var stringifyProperty = schema.stringifyProperty;
var components = module.exports.components = {}; // Keep track of registered components.

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
  var name = this.name;
  var elData = HTMLElement.prototype.getAttribute.call(el, name);

  this.el = el;
  // The last parameter of builData suppresses the warnings
  // We don't want to display warning messages when parsing the data
  // before updating the schema
  this.updateSchema(buildData(el, name, this.schema, elData, true));
  this.data = buildData(el, name, this.schema, elData);
  this.init();
  this.update();
};

Component.prototype = {
  /**
   * Contains the type schema and defaults for the data values.
   * Data is coerced into the types of the values of the defaults.
   */
  schema: { },

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
   * @param {object} prevData - Previous attributes of the component.
   */
  update: function (prevData) { /* no-op */ },

  updateSchema: function (prevData) { /* no-op */ },

  /**
   * Tick handler.
   * Called on each tick of the scene render loop.
   * Affected by play and pause.
   *
   * @param {number} time - Scene tick time.
   * @param {number} timeDelta - Difference in current render time and previous render time.
   */
  tick: undefined,

  /**
   * Called to start any dynamic behavior (e.g., animation, AI, events, physics).
   */
  play: function () { /* no-op */ },

  /**
   * Called to stop any dynamic behavior (e.g., animation, AI, events, physics).
   */
  pause: function () { /* no-op */ },

  /**
   * Remove handler. Similar to detachedCallback.
   * Called whenever component is removed from the entity (i.e., removeAttribute).
   * Components can use this to reset behavior on the entity.
   */
  remove: function () { /* no-op */ },

  /**
   * Parses each property based on property type.
   * If component is single-property, then parses the single property value.
   *
   * @param {string} value - HTML attribute value.
   * @param {boolean} silent - Suppress warning messages.
   * @returns {object} Component data.
   */
  parse: function (value, silent) {
    var schema = this.schema;
    if (isSingleProp(schema)) { return parseProperty(value, schema); }
    return parseProperties(objectParse(value), schema, true, silent);
  },

  /**
   * Stringify properties if necessary.
   *
   * Only called from `entity.setAttribute` for properties that accept an object value such as
   * vec3 {x, y, z}.
   *
   * @param {object} data - Complete component data.
   * @returns {string}
   */
  stringify: function (data) {
    var schema = this.schema;
    if (typeof data === 'string') { return data; }

    if (isSingleProp(schema)) { return stringifyProperty(data, schema); }
    data = stringifyProperties(data, schema);
    return objectStringify(data);
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
   * Called when new value is coming from the entity (e.g., attributeChangedCb)
   * or from its mixins. Does some parsing and applying before updating the
   * component.
   * Does not update if data has not changed.
   *
   * @param {string} value - HTML attribute value.
   */
  updateProperties: function (value) {
    var el = this.el;
    var isSinglePropSchema = isSingleProp(this.schema);
    var previousData = extendProperties({}, this.data, isSinglePropSchema);

    this.updateSchema(objectParse(value));
    this.data = buildData(el, this.name, this.schema, value);

    // Don't update if properties haven't changed
    if (!isSinglePropSchema && utils.deepEqual(previousData, this.data)) { return; }

    this.update(previousData);

    el.emit('componentchanged', {
      name: this.name,
      newData: this.getData(),
      oldData: previousData
    });
  },

  /**
   * Extends the schema of the component with a given new schema
   * Some components might want to mutate their schema based on
   * certain conditions. e.g: The material component changes its
   * squema based on the selected shader to account for the
   * different uniforms
   *  @param newSchema {object} - Schema that extends the original one.
   */
  extendSchema: function (newSchema) {
    // Copies original schema
    var extendedSchema = utils.extend({}, components[this.name].schema);
    // Extends original schema with the new one
    utils.extend(extendedSchema, newSchema);
    this.schema = processSchema(extendedSchema);
    this.el.emit('schemachanged', { component: this.name });
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
      writable: true
    };
  });

  if (components[name]) {
    throw new Error('The component `' + name + '` has been already registered. ' +
                    'Check that you are not loading two versions of the same component ' +
                    'or two different components of the same name.');
  }
  NewComponent = function (el) {
    Component.call(this, el);
  };
  NewComponent.prototype = Object.create(Component.prototype, proto);
  NewComponent.prototype.name = name;
  NewComponent.prototype.constructor = NewComponent;
  NewComponent.prototype.system = systems && systems.systems[name];

  components[name] = {
    Component: NewComponent,
    dependencies: NewComponent.prototype.dependencies,
    parse: NewComponent.prototype.parse.bind(NewComponent.prototype),
    schema: utils.extend(processSchema(NewComponent.prototype.schema)),
    stringify: NewComponent.prototype.stringify.bind(NewComponent.prototype),
    type: NewComponent.prototype.type
  };
  return NewComponent;
};

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
 *
 * Finally coerce the data to the types of the defaults.
 *
 * @param {object} el - Element to build data from.
 * @param {object} name - Component name.
 * @param {object} schema - Component schema.
 * @param {object} elData - Element current data.
 * @param {boolean} silent - Suppress warning messages.
 * @return {object} The component data
 */
function buildData (el, name, schema, elData, silent) {
  var componentDefined = elData !== null;
  var data = {};
  var isSinglePropSchema = isSingleProp(schema);
  var mixinEls = el.mixinEls;

  if (!isSinglePropSchema && typeof elData === 'string') {
    elData = objectParse(elData);
  }

  // 1. Default values (lowest precendence).
  if (isSinglePropSchema) {
    data = schema.default;
  } else {
    Object.keys(schema).forEach(function applyDefault (key) {
      data[key] = schema[key].default;
    });
  }

  // 2. Mixin values.
  mixinEls.forEach(applyMixin);
  function applyMixin (mixinEl) {
    var mixinData = mixinEl.getAttribute(name);
    if (mixinData) {
      data = extendProperties(data, mixinData, isSinglePropSchema);
    }
  }

  // 3. Attribute values (highest precendence).
  if (componentDefined) {
    data = extendProperties(data, elData, isSinglePropSchema);
  }

  // Parse and coerce using the schema.
  if (isSingleProp(schema)) {
    return parseProperty(data, schema);
  }

  return parseProperties(data, schema, undefined, silent);
}
module.exports.buildData = buildData;

/**
 * Deserializes style-like string into an object of properties.
 *
 * @param {string} value - HTML attribute value.
 * @returns {object} Property data.
 */
function objectParse (value) {
  var parsedData;
  if (typeof value !== 'string') { return value; }
  parsedData = styleParser.parse(value);
  return transformKeysToCamelCase(parsedData);
}

/**
 * Serialize an object of properties into a style-like string.
 *
 * @param {object} data - Property data.
 * @returns {string}
 */
function objectStringify (data) {
  if (typeof data === 'string') { return data; }
  return styleParser.stringify(data);
}

/**
* Object extending with checking for single-property schema.
*
* @param dest - Destination object or value.
* @param source - Source object or value
* @param {boolean} isSinglePropSchema - Whether or not schema is only a single property.
* @returns Overridden object or value.
*/
function extendProperties (dest, source, isSinglePropSchema) {
  if (isSinglePropSchema) {
    if (source === undefined ||
        (typeof source === 'object' && Object.keys(source).length === 0)) {
      return dest;
    }
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
