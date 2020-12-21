var components = require('./component');
var schema = require('./schema');
var utils = require('../utils/');
var base = require('./base');
var isObject = base.isObject;
var copyData = base.copyData;
var parseProperties = schema.parseProperties;
var parseProperty = schema.parseProperty;
var processSchema = schema.process;
var isSingleProp = schema.isSingleProperty;
var extendProperties = schema.extendProperties;
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
 * TODO: System and Component share the same baseProto as prototype. Still missing some function than Component  (e.g., setAttribute behavior).
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
  this.updateProperties(this.sceneEl.getAttribute(this.name));
};

const systemProto = {

  /**
   * Apply new system data if data has changed (from setAttribute).
   *
   * @param {string} attrValue - HTML attribute value.
   *        If undefined, use the cached attribute value and continue updating properties.
   * @param {boolean} clobber - The previous component data is overwritten by the attrValue
   * @private
   */
  updateProperties: function (attrValue, clobber) {
    // Parse the attribute value.
    if (attrValue !== null) {
      attrValue = this.parseAttrValueForCache(attrValue);
    }
    // Cache current attrValue for future updates. Updates `this.attrValue`.
    this.updateCachedAttrValue(attrValue, clobber);
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
  }

};
System.prototype = Object.assign(Object.create(base.baseProto), systemProto);
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
