var components = require('./component');
var schema = require('./schema');
var utils = require('../utils/');

var parseProperties = schema.parseProperties;
var parseProperty = schema.parseProperty;
var processSchema = schema.process;
var isSingleProp = schema.isSingleProperty;
var stringifyProperties = schema.stringifyProperties;
var stringifyProperty = schema.stringifyProperty;
var styleParser = utils.styleParser;
var objectPools = {};

var systems = module.exports.systems = {};  // Keep track of registered systems.

/**
 * System class definition.
 *
 * Systems provide global scope and services to a group of instantiated components of the
 * same class. They can also help abstract logic away from components such that components
 * only have to worry about data.
 *
 * For example, a physics component that creates a physics world that oversees
 * all entities with a physics or rigid body component.
 *
 * TODO: Have the System prototype reuse the Component prototype. Most code is copied
 * and some pieces are missing from the Component facilities (e.g.,
 * setAttribute behavior).
 *
 * @member {string} name - Name that system is registered under.
 * @member {Element} sceneEl - Handle to the scene element where system applies to.
 */
var System = module.exports.System = function (sceneEl) {
  var component = components && components.components[this.name];

  // Set reference to scene.
  this.el = sceneEl;
  this.sceneEl = sceneEl;
  this.initialized = false;
  this.isSingleProperty = isSingleProp(this.schema);
  this.isSinglePropertyObject =
    this.isSingleProperty &&
    isObject(parseProperty(undefined, this.schema)) &&
    !(this.schema.default instanceof window.HTMLElement);
  this.isObjectBased = !this.isSingleProperty || this.isSinglePropertyObject;
  this.objectPool = objectPools[this.name];
  this.attrName = this.name;
  // Set reference to matching component (if exists).
  if (component) {
    component.Component.prototype.system = this;
  }
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

  // Process system configuration.
  console.trace('here');
  this.updateProperties(this.sceneEl.getAttribute(this.name));
};

System.prototype = {
  /**
   * Schema to configure system.
   */
  schema: {},

  /**
   * Init handler. Called during scene initialization and is only run once.
   * Systems can use this to set initial state.
   */
  init: function () { /* no-op */ },

  /**
   * Update handler. Called during scene attribute updates.
   * Systems can use this to dynamically update their state.
   */
  update: function (prevData) { /* no-op */ },

  /**
   * Build data and call update handler.
   *
   * @private
   */
  updateProperties: function (attrValue) {
    // Parse the attribute value.
    if (attrValue !== null) {
      attrValue = this.parseAttrValueForCache(attrValue);
    }
    // Cache current attrValue for future updates. Updates `this.attrValue`.
    this.updateCachedAttrValue(attrValue);
    if (!Object.keys(schema).length) { return; }
    if (this.initialized) {
      this.updateSystem(attrValue);
      this.callUpdateHandler();
    } else {
      this.initSystem();
    }
  },
  initSystem: function () {
    var initialOldData;

    // Build data.
    this.data = this.buildData();

    // Initialize component.
    this.init();
    this.initialized = true;

    // Store current data as previous data for future updates.
    this.oldData = extendProperties(this.oldData, this.data, this.isObjectBased);

    // For oldData, pass empty object to multiple-prop schemas or object single-prop schema.
    // Pass undefined to rest of types.
    initialOldData = this.isObjectBased ? this.objectPool.use() : undefined;
    this.update(initialOldData);
    if (this.isObjectBased) { this.objectPool.recycle(initialOldData); }
  },
  /**
   * @param attrValue - Passed argument from setAttribute.
   */
  updateSystem: function (attrValue) {
    var key;

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
    var hasSystemChanged;

    // Store the previous old data before we calculate the new oldData.
    if (this.previousOldData instanceof Object) {
      utils.objectPool.clearObject(this.previousOldData);
    }
    if (this.isObjectBased) {
      copyData(this.previousOldData, this.oldData);
    } else {
      this.previousOldData = this.oldData;
    }

    hasSystemChanged = !utils.deepEqual(this.oldData, this.data);
    // Don't update if properties haven't changed.
    if (!hasSystemChanged) { return; }

    // Store current data as previous data for future updates.
    // Reuse `this.oldData` object to try not to allocate another one.
    if (this.oldData instanceof Object) { utils.objectPool.clearObject(this.oldData); }
    this.oldData = extendProperties(this.oldData, this.data, this.isObjectBased);
    // Update component with the previous old data.
    this.update(this.previousOldData);
  },

  /**
   * Parse data.
   */
  buildData: function (rawData) {
    var schema = this.schema;
    if (!Object.keys(schema).length) { return; }
    rawData = rawData || window.HTMLElement.prototype.getAttribute.call(this.sceneEl, this.name);
    if (isSingleProp(schema)) {
      return parseProperty(rawData, schema);
    } else {
      return parseProperties(styleParser.parse(rawData) || {}, schema);
    }
  },

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
   * Parses each property based on property type.
   * If component is single-property, then parses the single property value.
   *
   * @param {string} value - HTML attribute value.
   * @param {boolean} silent - Suppress warning messages.
   * @returns {object} System data.
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
   * @param {object} data - Complete system data.
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
  updateCachedAttrValue: function (value) {
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
    if (this.isObjectBased && this.attrValue) {
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
  }
};

/**
 * Registers a system to A-Frame.
 *
 * @param {string} name - Component name.
 * @param {object} definition - Component property and methods.
 * @returns {object} Component.
 */
module.exports.registerSystem = function (name, definition) {
  var i;
  var NewSystem;
  var proto = {};
  var scenes = utils.findAllScenes(document);

  // Format definition object to prototype object.
  Object.keys(definition).forEach(function (key) {
    proto[key] = {
      value: definition[key],
      writable: true
    };
  });

  if (systems[name]) {
    throw new Error('The system `' + name + '` has been already registered. ' +
      'Check that you are not loading two versions of the same system ' +
      'or two different systems of the same name.');
  }
  NewSystem = function (sceneEl) { System.call(this, sceneEl); };
  NewSystem.prototype = Object.create(System.prototype, proto);
  NewSystem.prototype.name = name;
  NewSystem.prototype.constructor = NewSystem;
  NewSystem.prototype.schema = utils.extend(processSchema(NewSystem.prototype.schema));
  objectPools[name] = utils.objectPool.createPool();
  systems[name] = NewSystem;

  // Initialize systems for existing scenes
  for (i = 0; i < scenes.length; i++) { scenes[i].initSystem(name); }
};

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

  if (isObjectBased && source && source.constructor === Object) {
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

function isObject (value) {
  return value && value.constructor === Object && !(value instanceof window.HTMLElement);
}

function isObjectOrArray (value) {
  return value && (value.constructor === Object || value.constructor === Array) &&
    !(value instanceof window.HTMLElement);
}
