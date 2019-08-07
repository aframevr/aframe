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

// Object pools by component, created upon registration.
var objectPools = {};

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
  this.evtDetail = {id: this.id, name: this.name};
  this.initialized = false;
  this.isSingleProperty = isSingleProp(this.schema);
  this.isSinglePropertyObject = this.isSingleProperty &&
                                isObject(parseProperty(undefined, this.schema)) &&
                                !(this.schema.default instanceof window.HTMLElement);
  this.isObjectBased = !this.isSingleProperty || this.isSinglePropertyObject;
  this.el.components[this.attrName] = this;
  this.objectPool = objectPools[this.name];

  const events = this.events;
  this.events = {};
  eventsBind(this, events);

  // Store component data from previous update call.
  this.attrValue = undefined;
  if (this.isObjectBased) {
    this.nextData = this.objectPool.use();
    // Drop any properties added by dynamic schemas in previous use
    utils.objectPool.removeUnusedKeys(this.nextData, this.schema);
    this.oldData = this.objectPool.use();
    utils.objectPool.removeUnusedKeys(this.oldData, this.schema);
    this.previousOldData = this.objectPool.use();
    utils.objectPool.removeUnusedKeys(this.previousOldData, this.schema);
    this.parsingAttrValue = this.objectPool.use();
    utils.objectPool.removeUnusedKeys(this.parsingAttrValue, this.schema);
  } else {
    this.nextData = undefined;
    this.oldData = undefined;
    this.previousOldData = undefined;
    this.parsingAttrValue = undefined;
  }

  // Last value passed to updateProperties.
  this.throttledEmitComponentChanged = utils.throttle(function emitChange () {
    el.emit('componentchanged', self.evtDetail, false);
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
   * Map of event names to binded event handlers that will be lifecycle-handled.
   * Will be detached on pause / remove.
   * Will be attached on play.
   */
  events: {},

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
   * @param {object} camera - Camera used to render the last frame.
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
    if (this.isSingleProperty) { return parseProperty(value, schema); }
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
    if (this.isSingleProperty) { return stringifyProperty(data, schema); }
    data = stringifyProperties(data, schema);
    return styleParser.stringify(data);
  },

  /**
   * Update the cache of the pre-parsed attribute value.
   *
   * @param {string} value - New data.
   * @param {boolean } clobber - Whether to wipe out and replace previous data.
   */
  updateCachedAttrValue: function (value, clobber) {
    var newAttrValue;
    var tempObject;
    var property;

    if (value === undefined) { return; }

    // If null value is the new attribute value, make the attribute value falsy.
    if (value === null) {
      if (this.isObjectBased && this.attrValue) {
        this.objectPool.recycle(this.attrValue);
      }
      this.attrValue = undefined;
      return;
    }

    if (value instanceof Object && !(value instanceof window.HTMLElement)) {
      // If value is an object, copy it to our pooled newAttrValue object to use to update
      // the attrValue.
      tempObject = this.objectPool.use();
      newAttrValue = utils.extend(tempObject, value);
    } else {
      newAttrValue = this.parseAttrValueForCache(value);
    }

    // Merge new data with previous `attrValue` if updating and not clobbering.
    if (this.isObjectBased && !clobber && this.attrValue) {
      for (property in this.attrValue) {
        if (newAttrValue[property] === undefined) {
          newAttrValue[property] = this.attrValue[property];
        }
      }
    }

    // Update attrValue.
    if (this.isObjectBased && !this.attrValue) {
      this.attrValue = this.objectPool.use();
    }
    utils.objectPool.clearObject(this.attrValue);
    this.attrValue = extendProperties(this.attrValue, newAttrValue, this.isObjectBased);
    utils.objectPool.clearObject(tempObject);
  },

  /**
   * Given an HTML attribute value parses the string based on the component schema.
   * To avoid double parsings of strings into strings we store the original instead
   * of the parsed one
   *
   * @param {string} value - HTML attribute value
   */
  parseAttrValueForCache: function (value) {
    var parsedValue;
    if (typeof value !== 'string') { return value; }
    if (this.isSingleProperty) {
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
      utils.objectPool.clearObject(this.parsingAttrValue);
      parsedValue = styleParser.parse(value, this.parsingAttrValue);
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
    if (attrValue === null || attrValue === undefined) { return; }
    window.HTMLElement.prototype.setAttribute.call(this.el, this.attrName,
                                                   this.stringify(attrValue));
  },

  /**
   * Apply new component data if data has changed (from setAttribute).
   *
   * @param {string} attrValue - HTML attribute value.
   *        If undefined, use the cached attribute value and continue updating properties.
   * @param {boolean} clobber - The previous component data is overwritten by the atrrValue
   */
  updateProperties: function (attrValue, clobber) {
    var el = this.el;

    // Just cache the attribute if the entity has not loaded
    // Components are not initialized until the entity has loaded
    if (!el.hasLoaded) {
      this.updateCachedAttrValue(attrValue);
      return;
    }

    // Parse the attribute value.
    // Cache current attrValue for future updates. Updates `this.attrValue`.
    // `null` means no value on purpose, do not set a default value, let mixins take over.
    if (attrValue !== null) {
      attrValue = this.parseAttrValueForCache(attrValue);
    }

    // Cache current attrValue for future updates.
    this.updateCachedAttrValue(attrValue, clobber);

    if (this.initialized) {
      this.updateComponent(attrValue, clobber);
      this.callUpdateHandler();
    } else {
      this.initComponent();
    }
  },

  initComponent: function () {
    var el = this.el;
    var initialOldData;

    // Build data.
    if (this.updateSchema) { this.updateSchema(this.buildData(this.attrValue, false, true)); }
    this.data = this.buildData(this.attrValue);

    // Component is being already initialized.
    if (el.initializingComponents[this.name]) { return; }

    // Prevent infinite loop in case of init method setting same component on the entity.
    el.initializingComponents[this.name] = true;
    // Initialize component.
    this.init();
    this.initialized = true;
    delete el.initializingComponents[this.name];

    // Store current data as previous data for future updates.
    this.oldData = extendProperties(this.oldData, this.data, this.isObjectBased);

    // For oldData, pass empty object to multiple-prop schemas or object single-prop schema.
    // Pass undefined to rest of types.
    initialOldData = this.isObjectBased ? this.objectPool.use() : undefined;
    this.update(initialOldData);
    if (this.isObjectBased) { this.objectPool.recycle(initialOldData); }

    // Play the component if the entity is playing.
    if (el.isPlaying) { this.play(); }
    el.emit('componentinitialized', this.evtDetail, false);
  },

  /**
   * @param attrValue - Passed argument from setAttribute.
   */
  updateComponent: function (attrValue, clobber) {
    var key;
    var mayNeedSchemaUpdate;

    if (clobber) {
      // Clobber. Rebuild.
      if (this.updateSchema) {
        this.updateSchema(this.buildData(this.attrValue, true, true));
      }
      this.data = this.buildData(this.attrValue, true, false);
      return;
    }

    // Apply new value to this.data in place since direct update.
    if (this.isSingleProperty) {
      if (this.isObjectBased) {
        parseProperty(attrValue, this.schema);
      }
      // Single-property (already parsed).
      this.data = attrValue;
      return;
    }

    parseProperties(attrValue, this.schema, true, this.name);

    // Check if we need to update schema.
    if (this.schemaChangeKeys.length) {
      for (key in attrValue) {
        if (this.schema[key].schemaChange) {
          mayNeedSchemaUpdate = true;
          break;
        }
      }
    }
    if (mayNeedSchemaUpdate) {
      // Rebuild data if need schema update.
      if (this.updateSchema) {
        this.updateSchema(this.buildData(this.attrValue, true, true));
      }
      this.data = this.buildData(this.attrValue, true, false);
      return;
    }

    // Normal update.
    for (key in attrValue) {
      if (attrValue[key] === undefined) { continue; }
      this.data[key] = attrValue[key];
    }
  },

  /**
   * Check if component should fire update and fire update lifecycle handler.
   */
  callUpdateHandler: function () {
    var hasComponentChanged;

    // Store the previous old data before we calculate the new oldData.
    if (this.previousOldData instanceof Object) {
      utils.objectPool.clearObject(this.previousOldData);
    }
    if (this.isObjectBased) {
      copyData(this.previousOldData, this.oldData);
    } else {
      this.previousOldData = this.oldData;
    }

    hasComponentChanged = !utils.deepEqual(this.oldData, this.data);

    // Don't update if properties haven't changed.
    // Always update rotation, position, scale.
    if (!this.isPositionRotationScale && !hasComponentChanged) { return; }

    // Store current data as previous data for future updates.
    // Reuse `this.oldData` object to try not to allocate another one.
    if (this.oldData instanceof Object) { utils.objectPool.clearObject(this.oldData); }
    this.oldData = extendProperties(this.oldData, this.data, this.isObjectBased);

    // Update component with the previous old data.
    this.update(this.previousOldData);

    this.throttledEmitComponentChanged();
  },

  handleMixinUpdate: function () {
    this.data = this.buildData(this.attrValue);
    this.callUpdateHandler();
  },

  /**
   * Reset value of a property to the property's default value.
   * If single-prop component, reset value to component's default value.
   *
   * @param {string} propertyName - Name of property to reset.
   */
  resetProperty: function (propertyName) {
    if (this.isObjectBased) {
      if (!(propertyName in this.attrValue)) { return; }
      delete this.attrValue[propertyName];
      this.data[propertyName] = this.schema[propertyName].default;
    } else {
      this.attrValue = this.schema.default;
      this.data = this.schema.default;
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
    var extendedSchema;
    // Clone base schema.
    extendedSchema = utils.extend({}, components[this.name].schema);
    // Extend base schema with new schema chunk.
    utils.extend(extendedSchema, schemaAddon);
    this.schema = processSchema(extendedSchema);
    this.el.emit('schemachanged', this.evtDetail);
  },

  /**
   * Build component data from the current state of the entity.data.
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
   * @return {object} The component data
   */
  buildData: function (newData, clobber, silent) {
    var componentDefined;
    var data;
    var defaultValue;
    var key;
    var mixinData;
    var nextData = this.nextData;
    var schema = this.schema;
    var i;
    var mixinEls = this.el.mixinEls;
    var previousData;

    // Whether component has a defined value. For arrays, treat empty as not defined.
    componentDefined = newData && newData.constructor === Array
      ? newData.length
      : newData !== undefined && newData !== null;

    if (this.isObjectBased) { utils.objectPool.clearObject(nextData); }

    // 1. Gather default values (lowest precendence).
    if (this.isSingleProperty) {
      if (this.isObjectBased) {
        // If object-based single-prop, then copy over the data to our pooled object.
        data = copyData(nextData, schema.default);
      } else {
        // If is plain single-prop, copy by value the default.
        data = isObjectOrArray(schema.default)
          ? utils.clone(schema.default)
          : schema.default;
      }
    } else {
      // Preserve previously set properties if clobber not enabled.
      previousData = !clobber && this.attrValue;

      // Clone default value if object so components don't share object
      data = previousData instanceof Object
        ? copyData(nextData, previousData)
        : nextData;

      // Apply defaults.
      for (key in schema) {
        defaultValue = schema[key].default;
        if (data[key] !== undefined) { continue; }
        // Clone default value if object so components don't share object
        data[key] = isObjectOrArray(defaultValue)
          ? utils.clone(defaultValue)
          : defaultValue;
      }
    }

    // 2. Gather mixin values.
    for (i = 0; i < mixinEls.length; i++) {
      mixinData = mixinEls[i].getAttribute(this.attrName);
      if (!mixinData) { continue; }
      data = extendProperties(data, mixinData, this.isObjectBased);
    }

    // 3. Gather attribute values (highest precendence).
    if (componentDefined) {
      if (this.isSingleProperty) {
        // If object-based, copy the value to not modify the original.
        if (isObject(newData)) {
          copyData(this.parsingAttrValue, newData);
          return parseProperty(this.parsingAttrValue, schema);
        }
        return parseProperty(newData, schema);
      }
      data = extendProperties(data, newData, this.isObjectBased);
    } else {
      // Parse and coerce using the schema.
      if (this.isSingleProperty) { return parseProperty(data, schema); }
    }

    return parseProperties(data, schema, undefined, this.name, silent);
  },

  /**
   * Attach events from component-defined events map.
   */
  eventsAttach: function () {
    var eventName;
    // Safety detach to prevent double-registration.
    this.eventsDetach();
    for (eventName in this.events) {
      this.el.addEventListener(eventName, this.events[eventName]);
    }
  },

  /**
   * Detach events from component-defined events map.
   */
  eventsDetach: function () {
    var eventName;
    for (eventName in this.events) {
      this.el.removeEventListener(eventName, this.events[eventName]);
    }
  },

  /**
   * Release and free memory.
   */
  destroy: function () {
    this.objectPool.recycle(this.attrValue);
    this.objectPool.recycle(this.oldData);
    this.objectPool.recycle(this.parsingAttrValue);
    this.attrValue = this.oldData = this.parsingAttrValue = undefined;
  }
};

function eventsBind (component, events) {
  var eventName;
  for (eventName in events) {
    component.events[eventName] = events[eventName].bind(component);
  }
}

// For testing.
if (window.debug) {
  var registrationOrderWarnings = module.exports.registrationOrderWarnings = {};
}

/**
 * Register a component to A-Frame.
 *
 * @param {string} name - Component name.
 * @param {object} definition - Component schema and lifecycle method handlers.
 * @returns {object} Component.
 */
module.exports.registerComponent = function (name, definition) {
  var NewComponent;
  var propertyName;
  var proto = {};
  var schema;
  var schemaIsSingleProp;

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
  NewComponent.prototype.isPositionRotationScale =
    name === 'position' || name === 'rotation' || name === 'scale';
  NewComponent.prototype.constructor = NewComponent;
  NewComponent.prototype.system = systems && systems.systems[name];
  NewComponent.prototype.play = wrapPlay(NewComponent.prototype.play);
  NewComponent.prototype.pause = wrapPause(NewComponent.prototype.pause);

  schema = utils.extend(processSchema(NewComponent.prototype.schema,
                                      NewComponent.prototype.name));
  schemaIsSingleProp = isSingleProp(NewComponent.prototype.schema);

  // Keep track of keys that may potentially change the schema.
  if (!schemaIsSingleProp) {
    NewComponent.prototype.schemaChangeKeys = [];
    for (propertyName in schema) {
      if (schema[propertyName].schemaChange) {
        NewComponent.prototype.schemaChangeKeys.push(propertyName);
      }
    }
  }

  // Create object pool for class of components.
  objectPools[name] = utils.objectPool.createPool();

  components[name] = {
    Component: NewComponent,
    dependencies: NewComponent.prototype.dependencies,
    isSingleProp: schemaIsSingleProp,
    multiple: NewComponent.prototype.multiple,
    name: name,
    parse: NewComponent.prototype.parse,
    parseAttrValueForCache: NewComponent.prototype.parseAttrValueForCache,
    schema: schema,
    stringify: NewComponent.prototype.stringify,
    type: NewComponent.prototype.type
  };
  return NewComponent;
};

/**
* Clone component data.
* Clone only the properties that are plain objects while keeping a reference for the rest.
*
* @param data - Component data to clone.
* @returns Cloned data.
*/
function copyData (dest, sourceData) {
  var parsedProperty;
  var key;
  for (key in sourceData) {
    if (sourceData[key] === undefined) { continue; }
    parsedProperty = sourceData[key];
    dest[key] = isObjectOrArray(parsedProperty)
      ? utils.clone(parsedProperty)
      : parsedProperty;
  }
  return dest;
}

/**
* Object extending with checking for single-property schema.
*
* @param dest - Destination object or value.
* @param source - Source object or value
* @param {boolean} isObjectBased - Whether values are objects.
* @returns Overridden object or value.
*/
function extendProperties (dest, source, isObjectBased) {
  var key;
  if (isObjectBased && source.constructor === Object) {
    for (key in source) {
      if (source[key] === undefined) { continue; }
      if (source[key] && source[key].constructor === Object) {
        dest[key] = utils.clone(source[key]);
      } else {
        dest[key] = source[key];
      }
    }
    return dest;
  }
  return source;
}

/**
 * Checks if a component has defined a method that needs to run every frame.
 */
function hasBehavior (component) {
  return component.tick || component.tock;
}

/**
 * Wrapper for defined pause method.
 * Pause component by removing tick behavior and calling user's pause method.
 *
 * @param pauseMethod {function}
 */
function wrapPause (pauseMethod) {
  return function pause () {
    var sceneEl = this.el.sceneEl;
    if (!this.isPlaying) { return; }
    pauseMethod.call(this);
    this.isPlaying = false;
    this.eventsDetach();
    // Remove tick behavior.
    if (!hasBehavior(this)) { return; }
    sceneEl.removeBehavior(this);
  };
}

/**
 * Wrapper for defined play method.
 * Play component by adding tick behavior and calling user's play method.
 *
 * @param playMethod {function}
 */
function wrapPlay (playMethod) {
  return function play () {
    var sceneEl = this.el.sceneEl;
    var shouldPlay = this.el.isPlaying && !this.isPlaying;
    if (!this.initialized || !shouldPlay) { return; }
    playMethod.call(this);
    this.isPlaying = true;
    this.eventsAttach();
    // Add tick behavior.
    if (!hasBehavior(this)) { return; }
    sceneEl.addBehavior(this);
  };
}

function isObject (value) {
  return value && value.constructor === Object && !(value instanceof window.HTMLElement);
}

function isObjectOrArray (value) {
  return value && (value.constructor === Object || value.constructor === Array) &&
         !(value instanceof window.HTMLElement);
}
