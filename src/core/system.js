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
 * and some pieces are missing from the Component facilities (e.g., attribute caching,
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
  this.buildData();
  this.init();
  this.update({});
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
  updateProperties: function (rawData) {
    var oldData = this.data;
    if (!Object.keys(schema).length) { return; }
    this.buildData(rawData);
    this.update(oldData);
  },

  /**
   * Parse data.
   */
  buildData: function (rawData) {
    var schema = this.schema;
    if (!Object.keys(schema).length) { return; }
    rawData = rawData || window.HTMLElement.prototype.getAttribute.call(this.sceneEl, this.name);
    if (isSingleProp(schema)) {
      this.data = parseProperty(rawData, schema);
    } else {
      this.data = parseProperties(styleParser.parse(rawData) || {}, schema);
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
function isObject (value) {
  return value && value.constructor === Object && !(value instanceof window.HTMLElement);
}
