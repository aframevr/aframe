/* global Node */
var schema = require('./schema');
var scenes = require('./scene/scenes');
var systems = require('./system');
var utils = require('../utils/');

var components = module.exports.components = {};  // Keep track of registered components.
var parseProperties = schema.parseProperties;
var parseProperty = schema.parseProperty;
var processSchema = schema.process;
var isSingleProp = schema.isSingleProperty;
var stringifyProperties = schema.stringifyProperties;
var stringifyProperty = schema.stringifyProperty;
var styleParser = utils.styleParser;
var warn = utils.debug('core:component:warn');

var aframeScript = document.currentScript;
var upperCaseRegExp = new RegExp('[A-Z]+');

/**
 * Component class definition.
 *
 * Components configure appearance, modify behavior, or add functionality to
 * entities. The behavior and appearance of an entity can be changed at runtime
 * by adding, removing, or updating components. Entities do not share instances
 * of components.
 *
 * @member {object} el - Reference to the entity element.
 * @member {string} attrValue - Value of the corresponding HTML attribute.
 * @member {object} data - Component data populated by parsing the
 *         mapped attribute of the component plus applying defaults and mixins.
 */
var Component = module.exports.Component = function (el, attrValue, id) {
  var self = this;
  this.el = el;
  this.id = id;
  this.attrName = this.name + (id ? '__' + id : '');
  this.initialized = false;
  this.el.components[this.attrName] = this;
  // Store component data from previous update call.
  this.oldData = undefined;
  // Last value passed to updateProperties.
  this.previousAttrValue = undefined;
  this.throttledEmitComponentChanged = utils.throttle(function emitComponentChange (oldData) {
    el.emit('componentchanged', {
      id: self.id,
      name: self.name,
      newData: self.data,
      oldData: oldData
    }, false);
  }, 200);
  this.updateProperties(attrValue);
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
   * Tock handler.
   * Called on each tock of the scene render loop.
   * Affected by play and pause.
   *
   * @param {number} time - Scene tick time.
   * @param {number} timeDelta - Difference in current render time and previous render time.
   */
  tock: undefined,

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
   * @param {string} value - New data.
   * @param {boolean } clobber - Whether to wipe out and replace previous data.
   */
  updateCachedAttrValue: function (value, clobber) {
    var attrValue = this.parseAttrValueForCache(value);
    var isSinglePropSchema = isSingleProp(this.schema);
    var property;
    if (value === undefined) { return; }

    // Merge new data with previous `attrValue` if updating and not clobbering.
    if (!isSinglePropSchema && !clobber && this.attrValue) {
      for (property in this.attrValue) {
        if (!(property in attrValue)) {
          attrValue[property] = this.attrValue[property];
        }
      }
    }

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
      /**
       * To avoid bogus double parsings. Cached values will be parsed when building
       * component data. For instance when parsing a src id to its url, we want to cache
       * original string and not the parsed one (#monster -> models/monster.dae)
       * so when building data we parse the expected value.
       */
      if (typeof parsedValue === 'string') { parsedValue = value; }
    } else {
      // Parse using the style parser to avoid double parsing of individual properties.
      parsedValue = styleParser.parse(value);
    }
    return parsedValue;
  },

  /**
   * Write cached attribute data to the entity DOM element.
   *
   * @param {boolean} isDefault - Whether component is a default component. Always flush for
   *   default components.
   */
  flushToDOM: function (isDefault) {
    var attrValue = isDefault ? this.data : this.attrValue;
    if (!attrValue) { return; }
    window.HTMLElement.prototype.setAttribute.call(this.el, this.attrName,
                                            this.stringify(attrValue));
  },

  /**
   * Apply new component data if data has changed.
   *
   * @param {string} attrValue - HTML attribute value.
   *        If undefined, use the cached attribute value and continue updating properties.
   * @param {boolean} clobber - The previous component data is overwritten by the atrrValue
   */
  updateProperties: function (attrValue, clobber) {
    var el = this.el;
    var isSinglePropSchema;
    var skipTypeChecking;
    var oldData = this.oldData;

    // Just cache the attribute if the entity has not loaded
    // Components are not initialized until the entity has loaded
    if (!el.hasLoaded) {
      this.updateCachedAttrValue(attrValue);
      return;
    }

    isSinglePropSchema = isSingleProp(this.schema);
    // Disable type checking if the passed attribute is an object and has not changed.
    skipTypeChecking = attrValue !== null && typeof this.previousAttrValue === 'object' &&
                       attrValue === this.previousAttrValue;
    // Cache previously passed attribute to decide if we skip type checking.
    this.previousAttrValue = attrValue;

    attrValue = this.parseAttrValueForCache(attrValue);
    if (this.updateSchema) { this.updateSchema(this.buildData(attrValue, false, true)); }
    this.data = this.buildData(attrValue, clobber, false, skipTypeChecking);

    // Cache current attrValue for future updates.
    this.updateCachedAttrValue(attrValue, clobber);

    if (!this.initialized) {
      // Component is being already initialized.
      if (el.initializingComponents[this.name]) { return; }
      // Prevent infinite loop in case of init method setting same component on the entity.
      el.initializingComponents[this.name] = true;
      // Initialize component.
      this.init();
      this.initialized = true;
      delete el.initializingComponents[this.name];
      // We pass empty object to multiple property schemas and single property schemas that parse to objects like position, rotation, scale
      // undefined is passed to the rest of types.
      oldData = (!isSinglePropSchema || typeof parseProperty(undefined, this.schema) === 'object') ? {} : undefined;
      // Store current data as previous data for future updates.
      this.oldData = extendProperties({}, this.data, isSinglePropSchema);
      this.update(oldData);
      // Play the component if the entity is playing.
      if (el.isPlaying) { this.play(); }
      el.emit('componentinitialized', {
        id: this.id,
        name: this.name,
        data: this.getData()
      }, false);
    } else {
      // Don't update if properties haven't changed
      if (!skipTypeChecking && utils.deepEqual(this.oldData, this.data)) { return; }
     // Store current data as previous data for future updates.
      this.oldData = extendProperties({}, this.data, isSinglePropSchema);
      // Update component.
      this.update(oldData);
      // Limit event to fire once every 200ms.
      this.throttledEmitComponentChanged(oldData);
    }
  },

  /**
   * Reset value of a property to the property's default value.
   * If single-prop component, reset value to component's default value.
   *
   * @param {string} propertyName - Name of property to reset.
   */
  resetProperty: function (propertyName) {
    if (isSingleProp(this.schema)) {
      this.attrValue = undefined;
    } else {
      if (!(propertyName in this.attrValue)) { return; }
      delete this.attrValue[propertyName];
    }
    this.updateProperties(this.attrValue);
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
   *
   * Finally coerce the data to the types of the defaults.
   *
   * @param {object} newData - Element new data.
   * @param {boolean} clobber - The previous data is completely replaced by the new one.
   * @param {boolean} silent - Suppress warning messages.
   * @param {boolean} skipTypeChecking - Skip type checking and cohercion.
   * @return {object} The component data
   */
  buildData: function (newData, clobber, silent, skipTypeChecking) {
    var self = this;
    var componentDefined = newData !== undefined && newData !== null;
    var data;
    var schema = this.schema;
    var isSinglePropSchema = isSingleProp(schema);
    var mixinEls = this.el.mixinEls;
    var previousData;

    // 1. Default values (lowest precendence).
    if (isSinglePropSchema) {
      // Clone default value if object so components don't share object.
      data = typeof schema.default === 'object' ? utils.extend({}, schema.default) : schema.default;
    } else {
      // Preserve previously set properties if clobber not enabled.
      previousData = !clobber && this.attrValue;
      // Clone default value if object so components don't share object
      data = typeof previousData === 'object' ? utils.extend({}, previousData) : {};
      Object.keys(schema).forEach(function applyDefault (key) {
        var defaultValue = schema[key].default;
        if (data[key] !== undefined) { return; }
        data[key] = defaultValue && defaultValue.constructor === Object
          ? utils.extend({}, defaultValue)
          : defaultValue;
      });
    }

    // 2. Mixin values.
    mixinEls.forEach(function handleMixinUpdate (mixinEl) {
      var mixinData = mixinEl.getAttribute(self.attrName);
      if (mixinData) {
        data = extendProperties(data, mixinData, isSinglePropSchema);
      }
    });

    // 3. Attribute values (highest precendence).
    if (componentDefined) {
      if (isSinglePropSchema) {
        if (skipTypeChecking === true) { return newData; }
        return parseProperty(newData, schema);
      }
      data = extendProperties(data, newData, isSinglePropSchema);
    } else {
      if (skipTypeChecking === true) { return data; }
      // Parse and coerce using the schema.
      if (isSinglePropSchema) { return parseProperty(data, schema); }
    }

    if (skipTypeChecking === true) { return data; }
    return parseProperties(data, schema, undefined, this.name, silent);
  }
};

// For testing.
if (window.debug) {
  var registrationOrderWarnings = module.exports.registrationOrderWarnings = {};
}

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

  // Warning if component is statically registered after the scene.
  if (document.currentScript && document.currentScript !== aframeScript) {
    scenes.forEach(function checkPosition (sceneEl) {
      // Okay to register component after the scene at runtime.
      if (sceneEl.hasLoaded) { return; }

      // Check that component is declared before the scene.
      if (document.currentScript.compareDocumentPosition(sceneEl) ===
          Node.DOCUMENT_POSITION_FOLLOWING) { return; }

      warn('The component `' + name + '` was registered in a <script> tag after the scene. ' +
           'Component <script> tags in an HTML file should be declared *before* the scene ' +
           'such that the component is available to entities during scene initialization.');

      // For testing.
      if (window.debug) { registrationOrderWarnings[name] = true; }
    });
  }

  if (upperCaseRegExp.test(name) === true) {
    warn('The component name `' + name + '` contains uppercase characters, but ' +
         'HTML will ignore the capitalization of attribute names. ' +
         'Change the name to be lowercase: `' + name.toLowerCase() + '`');
  }

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
    isSingleProp: isSingleProp(NewComponent.prototype.schema),
    multiple: NewComponent.prototype.multiple,
    parse: NewComponent.prototype.parse,
    parseAttrValueForCache: NewComponent.prototype.parseAttrValueForCache,
    schema: utils.extend(processSchema(NewComponent.prototype.schema, NewComponent.prototype.name)),
    stringify: NewComponent.prototype.stringify,
    type: NewComponent.prototype.type
  };
  return NewComponent;
};

/**
* Object extending with checking for single-property schema.
*
* @param dest - Destination object or value.
* @param source - Source object or value
* @param {boolean} isSinglePropSchema - Whether or not schema is only a single property.
* @returns Overridden object or value.
*/
function extendProperties (dest, source, isSinglePropSchema) {
  if (isSinglePropSchema && (source === null || typeof source !== 'object')) { return source; }
  return utils.extend(dest, source);
}

/**
 * Checks if a component has defined a method that needs to run every frame.
 */
function hasBehavior (component) {
  return component.tick || component.tock;
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
    if (!hasBehavior(this)) { return; }
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
    if (!hasBehavior(this)) { return; }
    sceneEl.addBehavior(this);
  };
}
