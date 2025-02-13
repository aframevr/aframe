/* global Node */
import * as schema from './schema.js';
import scenes from './scene/scenes.js';
import * as systems from './system.js';
import * as utils from '../utils/index.js';

export var components = {}; // Keep track of registered components.
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
var emptyInitialOldData = Object.freeze({});
var encounteredUnknownProperties = [];

// Handler translating get/set into getComputedPropertyValue and recomputeProperty.
var attrValueProxyHandler = {
  get: function (target, prop) {
    return target.getComputedPropertyValue(prop);
  },
  set: function (target, prop, newValue) {
    if (prop in target.schema) {
      target.recomputeProperty(prop, newValue);
    } else if (newValue !== undefined) {
      target.handleUnknownProperty(prop, newValue);
    }
    return true;
  }
};

/**
 * Component class definition.
 *
 * Components configure appearance, modify behavior, or add functionality to
 * entities. The behavior and appearance of an entity can be changed at runtime
 * by adding, removing, or updating components. Entities do not share instances
 * of components.
 *
 * @constructor
 * @param {object} el - Reference to the entity element.
 * @param {string} attrValue - Value of the corresponding HTML attribute.
 * @param {string} id - Optional id for differentiating multiple instances on the same entity.
 */
export var Component = function (el, attrValue, id) {
  var self = this;

  // If component is sceneOnly check the entity is the scene element
  if (this.sceneOnly && !el.isScene) {
    throw new Error('Component `' + this.name + '` can only be applied to <a-scene>');
  }

  // If component name has an id we check component type multiplicity.
  if (id && !this.multiple) {
    throw new Error('Trying to initialize multiple ' +
                    'components of type `' + this.name +
                    '`. There can only be one component of this type per entity.');
  }

  this.el = el;
  this.id = id;
  this.attrName = this.name + (id ? '__' + id : '');
  this.evtDetail = {id: this.id, name: this.name};
  this.initialized = false;
  this.el.components[this.attrName] = this;
  this.objectPool = objectPools[this.name];

  var events = this.events;
  this.events = {};
  eventsBind(this, events);

  // Allocate data and oldData.
  this.attrValue = undefined;
  if (this.isObjectBased) {
    this.data = this.objectPool.use();
    // Drop any properties added by dynamic schemas in previous use
    utils.objectPool.removeUnusedKeys(this.data, this.schema);
    this.oldData = this.objectPool.use();
    utils.objectPool.removeUnusedKeys(this.oldData, this.schema);

    this.attrValueProxy = new Proxy(this, attrValueProxyHandler);
  } else {
    this.data = undefined;
    this.oldData = undefined;
    this.attrValueProxy = undefined;
  }

  // Dynamic schema requires special handling of unknown properties to avoid false-positives.
  this.deferUnknownPropertyWarnings = !!this.updateSchema;

  // Last value passed to updateProperties.
  // This type of throttle ensures that when a burst of changes occurs, the final change to the
  // component always triggers an event (so a consumer of this event will end up reading the correct
  // final state, following a burst of changes).
  this.throttledEmitComponentChanged = utils.throttleLeadingAndTrailing(function emitChange () {
    el.emit('componentchanged', self.evtDetail, false);
  }, 200);

  // Initial call to updateProperties, force clobber to trigger an initial computation of all properties.
  this.updateProperties(attrValue, true);
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
   * Map of event names to bound event handlers that will be lifecycle-handled.
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

  /**
   * Update schema handler. Allows the component to dynamically change its schema.
   * Called whenever a property marked as schemaChange changes.
   * Also called on initialization when the component receives initial data.
   *
   * @param {object} data - The data causing the schema change
   */
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
   * @param {boolean} clobber - The previous component data is overwritten by the attrValue.
   */
  updateProperties: function (attrValue, clobber) {
    var el = this.el;

    // Update data
    this.updateData(attrValue, clobber);

    // Just cache the attribute if the entity has not loaded
    // Components are not initialized until the entity has loaded
    if (!el.hasLoaded && !el.isLoading) {
      return;
    }

    if (this.initialized) {
      this.callUpdateHandler();
    } else {
      this.initComponent();
    }
  },

  initComponent: function () {
    var el = this.el;
    var initialOldData;

    // Component is already being initialized.
    if (el.initializingComponents[this.name]) { return; }

    // Prevent infinite loop in case of init method setting same component on the entity.
    el.initializingComponents[this.name] = true;
    // Initialize component.
    this.init();
    this.initialized = true;
    delete el.initializingComponents[this.name];

    // For oldData, pass empty object to multiple-prop schemas or object single-prop schema.
    // Pass undefined to rest of types.
    initialOldData = this.isObjectBased ? emptyInitialOldData : undefined;
    // Unset dataChanged before calling update, as update might (indirectly) trigger a change
    this.dataChanged = false;
    this.storeOldData();
    this.update(initialOldData);

    // Play the component if the entity is playing.
    if (el.isPlaying) { this.play(); }
    el.emit('componentinitialized', this.evtDetail, false);
  },

  /**
   * @param {string|object} attrValue - Passed argument from setAttribute.
   * @param {boolean} clobber - Whether or not to overwrite previous data by the attrValue.
   */
  updateData: function (attrValue, clobber) {
    // Single property (including object based single property)
    if (this.isSingleProperty) {
      this.recomputeProperty(undefined, attrValue);
      return;
    }

    // Multi-property
    if (clobber) {
      // Clobber. Rebuild.
      utils.objectPool.clearObject(this.attrValue);
      this.recomputeData(attrValue);
      // Quirk: always update schema when clobbering, even if there are no schemaChange properties in schema.
      this.schemaChangeRequired = !!this.updateSchema;
    } else if (typeof attrValue === 'string') {
      // AttrValue is a style string, parse it into the attrValueProxy object
      styleParser.parse(attrValue, this.attrValueProxy);
    } else {
      // AttrValue is an object, apply it to the attrValueProxy object
      utils.extend(this.attrValueProxy, attrValue);
    }

    // Update schema if needed
    this.updateSchemaIfNeeded(attrValue);
  },

  updateSchemaIfNeeded: function (attrValue) {
    if (this.schemaChangeRequired && this.updateSchema) {
      encounteredUnknownProperties.length = 0;

      this.updateSchema(this.data);
      utils.objectPool.removeUnusedKeys(this.data, this.schema);
      this.recomputeData(attrValue);
      this.schemaChangeRequired = false;

      // Report any excess properties not valid in the updated schema
      for (var key in this.attrValue) {
        if (this.attrValue[key] === undefined) { continue; }
        if (encounteredUnknownProperties.indexOf(key) !== -1) { continue; }
        if (!(key in this.schema)) {
          warn('Unknown property `' + key + '` for component `' + this.name + '`.');
        }
      }
    }

    // Log any pending unknown property warning
    for (var i = 0; i < encounteredUnknownProperties.length; i++) {
      warn('Unknown property `' + encounteredUnknownProperties[i] +
            '` for component `' + this.name + '`.');
    }
    encounteredUnknownProperties.length = 0;
  },

  /**
   * Check if component should fire update and fire update lifecycle handler.
   */
  callUpdateHandler: function () {
    // Don't update if properties haven't changed.
    // Always update rotation, position, scale.
    if (!this.isPositionRotationScale && !this.dataChanged) { return; }

    // Unset dataChanged before calling update, as update might (indirectly) trigger a change
    this.dataChanged = false;

    // Flag oldData in use while inside `update()`
    var oldData = this.oldData;
    this.oldDataInUse = true;
    this.update(oldData);
    if (oldData !== this.oldData) {
      // Recursive update replaced oldData, so clean up our copy.
      this.objectPool.recycle(oldData);
    }
    this.oldDataInUse = false;

    // Update oldData to match current data state for next update
    this.storeOldData();

    this.throttledEmitComponentChanged();
  },

  handleMixinUpdate: function () {
    this.recomputeData();
    this.updateSchemaIfNeeded();
    this.callUpdateHandler();
  },

  /**
   * Reset value of a property to the property's default value.
   * If single property component, reset value to component's default value.
   *
   * @param {string} propertyName - Name of property to reset.
   */
  resetProperty: function (propertyName) {
    if (!this.isSingleProperty && !(propertyName in this.schema)) { return; }

    // Reset attrValue for single- and multi-property components
    if (propertyName) {
      this.attrValue[propertyName] = undefined;
    } else {
      // Return attrValue for object based single property components
      if (this.isObjectBased) {
        this.objectPool.recycle(this.attrValue);
      }
      this.attrValue = undefined;
    }
    this.recomputeProperty(propertyName, undefined);
    this.updateSchemaIfNeeded();
    this.callUpdateHandler();
  },

  /**
   * Extend schema of component given a partial schema.
   *
   * Some components might want to mutate their schema based on certain properties.
   * e.g., Material component changes its schema based on `shader` to account for different
   * uniforms.
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

  getComputedPropertyValue: function (key) {
    var mixinEls = this.el.mixinEls;

    // Defined as attribute on entity
    var attrValue = (this.attrValue && key) ? this.attrValue[key] : this.attrValue;
    if (attrValue !== undefined) {
      return attrValue;
    }

    // Inherited from mixin
    for (var i = mixinEls.length - 1; i >= 0; i--) {
      var mixinData = mixinEls[i].getAttribute(this.attrName);
      if ((mixinData === null) || (key && !(key in mixinData))) { continue; }
      return key ? mixinData[key] : mixinData;
    }

    // Schema default
    var schemaDefault = key ? this.schema[key].default : this.schema.default;
    return schemaDefault;
  },

  recomputeProperty: function (key, newValue) {
    var propertySchema = key ? this.schema[key] : this.schema;

    if (newValue !== undefined && newValue !== null) {
      // Initialize attrValue ad-hoc as it's the return value of getDOMAttribute
      // and is expected to be undefined until a property has been set.
      if (this.attrValue === undefined && this.isObjectBased) {
        this.attrValue = this.objectPool.use();
      }

      // Parse the new value into attrValue (re-using objects where possible)
      var newAttrValue = key ? this.attrValue[key] : this.attrValue;
      // Some property types (like selectors) depend on external state (e.g. DOM) during parsing and can't be cached.
      newAttrValue = propertySchema.isCacheable ? parseProperty(newValue, propertySchema, newAttrValue) : newValue;
      // In case the output is a string, store the unparsed value (no double parsing and helps inspector)
      if (typeof newAttrValue === 'string') {
        // Quirk: empty strings aren't considered values for single-property schemas
        newAttrValue = newValue === '' ? undefined : newValue;
      }
      // Update attrValue with new, possibly parsed, value.
      if (key) {
        this.attrValue[key] = newAttrValue;
      } else {
        this.attrValue = newAttrValue;
      }
    }

    // Quirk: recursive updates keep this.oldData in use, meaning oldData isn't up-to-date yet.
    // Before the first change to data is made, provision a new oldData and update it.
    // Cleanup of orphaned oldData objects is handled in callUpdateHandler.
    if (this.oldDataInUse) {
      this.oldData = this.objectPool.use();
      utils.objectPool.removeUnusedKeys(this.oldData, this.schema);
      this.storeOldData();
      this.oldDataInUse = false;
    }

    var oldComputedValue = key ? this.oldData[key] : this.oldData;
    var targetValue = key ? this.data[key] : this.data;

    var newComputedValue = parseProperty(this.getComputedPropertyValue(key), propertySchema, targetValue);
    // Quirk: Single-property arrays DO NOT share references, while arrays in multi-property components do.
    if (propertySchema.type === 'array' && !key) {
      newComputedValue = utils.clone(newComputedValue);
    }

    // Check if the resulting (parsed) value differs from before
    if (!propertySchema.equals(newComputedValue, oldComputedValue)) {
      this.dataChanged = true;

      // Mark schema change required
      if (propertySchema.schemaChange) {
        this.schemaChangeRequired = true;
      }
    }

    // Update data with the newly computed value.
    if (key) {
      this.data[key] = newComputedValue;
    } else {
      this.data = newComputedValue;
    }

    return newComputedValue;
  },

  handleUnknownProperty: function (key, newValue) {
    // Persist the raw value on attrValue
    if (this.attrValue === undefined) {
      this.attrValue = this.objectPool.use();
    }
    this.attrValue[key] = newValue;

    // Handle warning the user about the unknown property.
    // Since a component might have a dynamic schema, the warning might be
    // silenced or deferred to avoid false-positives.
    if (this.deferUnknownPropertyWarnings) {
      encounteredUnknownProperties.push(key);
    } else if (!this.silenceUnknownPropertyWarnings) {
      warn('Unknown property `' + key + '` for component `' + this.name + '`.');
    }
  },

  /**
   * Updates oldData to the current state of data taking care to
   * copy and clone objects where necessary.
   */
  storeOldData: function () {
    // Non object based single properties
    if (!this.isObjectBased) {
      this.oldData = this.data;
      return;
    }

    // Object based single property
    if (this.isSingleProperty) {
      this.oldData = parseProperty(this.data, this.schema, this.oldData);
      return;
    }

    // Object based
    var key;
    for (key in this.schema) {
      if (this.data[key] === undefined) { continue; }
      if (this.data[key] && typeof this.data[key] === 'object') {
        this.oldData[key] = parseProperty(this.data[key], this.schema[key], this.oldData[key]);
      } else {
        this.oldData[key] = this.data[key];
      }
    }
  },

  /**
   * Triggers a recompute of the data object.
   *
   * @param {string|object} attrValue - Optional additional data updates
   */
  recomputeData: function (attrValue) {
    var key;

    if (this.isSingleProperty) {
      this.recomputeProperty(undefined, attrValue);
      return;
    }

    for (key in this.schema) {
      this.attrValueProxy[key] = undefined;
    }

    if (attrValue && typeof attrValue === 'object') {
      utils.extend(this.attrValueProxy, attrValue);
    } else if (typeof attrValue === 'string') {
      // AttrValue is a style string, parse it into the attrValueProxy object
      styleParser.parse(attrValue, this.attrValueProxy);
    }
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
    this.objectPool.recycle(this.data);
    this.objectPool.recycle(this.oldData);
    this.attrValue = this.data = this.oldData = this.attrValueProxy = undefined;
  }
};

function eventsBind (component, events) {
  var eventName;
  for (eventName in events) {
    component.events[eventName] = events[eventName].bind(component);
  }
}

// For testing.
export var registrationOrderWarnings = {};

/**
 * Register a component to A-Frame.
 *
 * @param {string} name - Component name.
 * @param {object} definition - Component schema and lifecycle method handlers.
 * @returns {object} Component.
 */
export function registerComponent (name, definition) {
  var NewComponent;
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
  NewComponent.prototype.isSingleProperty = schemaIsSingleProp = isSingleProp(NewComponent.prototype.schema);
  NewComponent.prototype.isObjectBased = !schemaIsSingleProp ||
              (schemaIsSingleProp && (isObject(schema.default) || isObject(parseProperty(undefined, schema))));

  // Create object pool for class of components.
  objectPools[name] = utils.objectPool.createPool();

  components[name] = {
    Component: NewComponent,
    dependencies: NewComponent.prototype.dependencies,
    before: NewComponent.prototype.before,
    after: NewComponent.prototype.after,
    isSingleProperty: NewComponent.prototype.isSingleProperty,
    isObjectBased: NewComponent.prototype.isObjectBased,
    multiple: NewComponent.prototype.multiple,
    sceneOnly: NewComponent.prototype.sceneOnly,
    name: name,
    schema: schema,
    stringify: NewComponent.prototype.stringify
  };

  // Notify all scenes
  for (var i = 0; i < scenes.length; i++) {
    scenes[i].emit('componentregistered', {name: name}, false);
  }

  return NewComponent;
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
 * @param {function} pauseMethod
 * @returns {function}
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
 * @param {function} playMethod
 * @returns {function}
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
