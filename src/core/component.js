/* global HTMLElement */
var schema = require('./schema');
var systems = require('./system');
var utils = require('../utils/');

var components = module.exports.components = {}; // Keep track of registered components.
var parseProperties = schema.parseProperties;
var parseProperty = schema.parseProperty;
var processSchema = schema.process;
var isSingleProp = schema.isSingleProperty;
var stringifyProperties = schema.stringifyProperties;
var stringifyProperty = schema.stringifyProperty;
var styleParser = utils.styleParser;

/**
 * Component class definition.
 *
 * Components configure appearance, modify behavior, or add functionality to
 * entities. The behavior and appearance of an entity can be changed at runtime
 * by adding, removing, or updating components. Entities do not share instances
 * of components.
 *
 * @member {object} el - Reference to the entity element.
 * @member {string} attr - Component name exposed as an HTML attribute.
 * @member {object} data - Component data populated by parsing the
 *         mapped attribute of the component plus applying defaults and mixins.
 */
var Component = module.exports.Component = function (el, attr, id) {
  this.el = el;
  this.id = id;
  this.attrName = this.name + (id ? '__' + id : '');
  this.updateCachedAttrValue(attr);
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
   * @param {object} prevData - Previous attributes of the component.
   */
  update: function (prevData) { /* no-op */ },

  updateSchema: undefined,

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
    return parseProperties(styleParser.parse(value), schema, true, this.name, silent);
  },

  /**
   * Stringify properties if necessary.
   *
   * Only called from `Entity.setAttribute` for properties whose parsers accept a non-string
   * value (e.g., selector, vec3 property types).
   *
   * @param {object} data - Complete component data.
   * @returns {string}
   */
  stringify: function (data) {
    var schema = this.schema;
    if (typeof data === 'string') { return data; }
    if (isSingleProp(schema)) { return stringifyProperty(data, schema); }
    data = stringifyProperties(data, schema);
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
   * Update the cache of the pre-parsed attribute value.
   *
   * @param {string} value - HTML attribute value.
   */
  updateCachedAttrValue: function (value) {
    var isSinglePropSchema = isSingleProp(this.schema);
    var attrValue = this.parseAttrValueForCache(value);
    this.attrValue = extendProperties({}, attrValue, isSinglePropSchema);
  },

  /**
   * Given an HTML attribute value parses the string
   * based on the component schema. To avoid double parsings of
   * strings into strings we store the original instead
   * of the parsed one
   *
   * @param {string} value - HTML attribute value
   */
  parseAttrValueForCache: function (value) {
    var parsedValue;
    if (typeof value !== 'string') { return value; }
    if (isSingleProp(this.schema)) {
      parsedValue = this.schema.parse(value);
      // To avoid bogus double parsings. The cached values will
      // be parsed when building the component data.
      // For instance when parsing a src id to it's url.
      // We want to cache the original string and not the parsed
      // one (#monster -> models/monster.dae) so when building
      // data we parse the expected value.
      if (typeof parsedValue === 'string') { parsedValue = value; }
    } else {
      // We just parse using the style parser to avoid double parsing
      // of individual properties.
      parsedValue = styleParser.parse(value);
    }
    return parsedValue;
  },

  /**
   * Writes cached attribute data to the entity DOM element.
   */
  flushToDOM: function () {
    var attrValue = this.attrValue;
    if (!attrValue) { return; }
    HTMLElement.prototype.setAttribute.call(this.el, this.attrName, this.stringify(attrValue));
  },

  /**
   * Apply new component data if data has changed.
   *
   * @param {string} value - HTML attribute value.
   *        If undefined, use the cached attribute value and continue updating properties.
   */
  updateProperties: function (value) {
    var el = this.el;
    var isSinglePropSchema = isSingleProp(this.schema);
    var oldData = extendProperties({}, this.data, isSinglePropSchema);

    if (value !== undefined) { this.updateCachedAttrValue(value); }

    if (this.updateSchema) {
      this.updateSchema(buildData(el, this.name, this.schema, this.attrValue, true));
    }
    this.data = buildData(el, this.name, this.schema, this.attrValue);

    // Don't update if properties haven't changed
    if (!isSinglePropSchema && utils.deepEqual(oldData, this.data)) { return; }

    if (!this.initialized) {
      this.init();
      this.initialized = true;
      // Play the component if the entity is playing.
      this.update(oldData);
      if (el.isPlaying) { this.play(); }
    } else {
      this.update(oldData);
    }

    el.emit('componentchanged', {
      id: this.id,
      name: this.name,
      newData: this.getData(),
      oldData: oldData
    }, false);
  },

  /**
   * Extend schema of component given a partial schema.
   *
   * Some components might want to mutate their schema based on certain properties.
   * e.g., Material component changes its schema based on `shader` to account for different
   * uniforms
   *
   * @param {object} schemaAddon - Schema chunk that extend base schema.
   */
  extendSchema: function (schemaAddon) {
    // Clone base schema.
    var extendedSchema = utils.extend({}, components[this.name].schema);
    // Extend base schema with new schema chunk.
    utils.extend(extendedSchema, schemaAddon);
    this.schema = processSchema(extendedSchema);
    this.el.emit('schemachanged', {component: this.name});
  }
};

/**
 * Registers a component to A-Frame.
 *
 * @param {string} name - Component name.
 * @param {object} definition - Component schema and lifecycle method handlers.
 * @returns {object} Component.
 */
module.exports.registerComponent = function (name, definition) {
  var NewComponent;
  var proto = {};

  if (name.indexOf('__') !== -1) {
    throw new Error('The component name `' + name + '` is not allowed. ' +
                    'The sequence __ (double underscore) is reserved to specify an id' +
                    ' for multiple components of the same type');
  }

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
  NewComponent = function (el, attr, id) {
    Component.call(this, el, attr, id);
    if (!el.hasLoaded) { return; }
    this.updateProperties(this.attrValue);
  };

  NewComponent.prototype = Object.create(Component.prototype, proto);
  NewComponent.prototype.name = name;
  NewComponent.prototype.constructor = NewComponent;
  NewComponent.prototype.system = systems && systems.systems[name];
  NewComponent.prototype.play = wrapPlay(NewComponent.prototype.play);
  NewComponent.prototype.pause = wrapPause(NewComponent.prototype.pause);

  components[name] = {
    Component: NewComponent,
    dependencies: NewComponent.prototype.dependencies,
    multiple: NewComponent.prototype.multiple,
    parse: NewComponent.prototype.parse,
    parseAttrValueForCache: NewComponent.prototype.parseAttrValueForCache,
    schema: utils.extend(processSchema(NewComponent.prototype.schema)),
    stringify: NewComponent.prototype.stringify,
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
  var componentDefined = elData !== undefined && elData !== null;
  var data;
  var isSinglePropSchema = isSingleProp(schema);
  var mixinEls = el.mixinEls;

  // 1. Default values (lowest precendence).
  if (isSinglePropSchema) {
    data = schema.default;
  } else {
    data = {};
    Object.keys(schema).forEach(function applyDefault (key) {
      data[key] = schema[key].default;
    });
  }

  // 2. Mixin values.
  mixinEls.forEach(handleMixinUpdate);
  function handleMixinUpdate (mixinEl) {
    var mixinData = mixinEl.getAttribute(name);
    if (mixinData) {
      data = extendProperties(data, mixinData, isSinglePropSchema);
    }
  }

  // 3. Attribute values (highest precendence).
  if (componentDefined) {
    if (isSinglePropSchema) { return parseProperty(elData, schema); }
    data = extendProperties(data, elData, isSinglePropSchema);
    return parseProperties(data, schema, undefined, name, silent);
  } else {
     // Parse and coerce using the schema.
    if (isSinglePropSchema) { return parseProperty(data, schema); }
    return parseProperties(data, schema, undefined, name, silent);
  }
}
module.exports.buildData = buildData;

/**
* Object extending with checking for single-property schema.
*
* @param dest - Destination object or value.
* @param source - Source object or value
* @param {boolean} isSinglePropSchema - Whether or not schema is only a single property.
* @returns Overridden object or value.
*/
function extendProperties (dest, source, isSinglePropSchema) {
  if (isSinglePropSchema) { return source; }
  return utils.extend(dest, source);
}

/**
 * Wrapper for user defined pause method
 * Pause component by removing tick behavior and calling user's pause method.
 *
 * @param pauseMethod {function} - user defined pause method
 */
function wrapPause (pauseMethod) {
  return function pause () {
    var sceneEl = this.el.sceneEl;
    if (!this.isPlaying) { return; }
    pauseMethod.call(this);
    this.isPlaying = false;
    // Remove tick behavior.
    if (!this.tick) { return; }
    sceneEl.removeBehavior(this);
  };
}

/**
 * Wrapper for user defined play method
 * Play component by adding tick behavior and calling user's play method.
 *
 * @param playMethod {function} - user defined play method
 *
 */
function wrapPlay (playMethod) {
  return function play () {
    var sceneEl = this.el.sceneEl;
    var shouldPlay = this.el.isPlaying && !this.isPlaying;
    if (!this.initialized || !shouldPlay) { return; }
    playMethod.call(this);
    this.isPlaying = true;
    // Add tick behavior.
    if (!this.tick) { return; }
    sceneEl.addBehavior(this);
  };
}
