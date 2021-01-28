/* global Node */
var schema = require('./schema');
var scenes = require('./scene/scenes');
var systems = require('./system');
var utils = require('../utils/');
var base = require('./base');
var copyData = base.copyData;
var isObject = base.isObject;
var isObjectOrArray = base.isObjectOrArray;
var components = module.exports.components = {};  // Keep track of registered components.
var parseProperties = schema.parseProperties;
var parseProperty = schema.parseProperty;
var processSchema = schema.process;
var isSingleProp = schema.isSingleProperty;
var extendProperties = schema.extendProperties;
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

const componentProto = {

  /**
   * Map of event names to binded event handlers that will be lifecycle-handled.
   * Will be detached on pause / remove.
   * Will be attached on play.
   */
  events: {},

  updateSchema: undefined,

  /**
   * Remove handler. Similar to detachedCallback.
   * Called whenever component is removed from the entity (i.e., removeAttribute).
   * Components can use this to reset behavior on the entity.
   */
  remove: function () { /* no-op */ },

  /**
   * Apply new component data if data has changed (from setAttribute).
   *
   * @param {string} attrValue - HTML attribute value.
   *        If undefined, use the cached attribute value and continue updating properties.
   * @param {boolean} clobber - The previous component data is overwritten by the attrValue
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
Component.prototype = Object.assign(Object.create(base.base), componentProto);

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

