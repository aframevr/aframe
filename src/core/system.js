import { parseProperties, parseProperty, process as processSchema, isSingleProperty as isSingleProp } from './schema.js';
import * as components from './component.js';
import * as utils from '../utils/index.js';
import * as ready from './readyState.js';

var styleParser = utils.styleParser;

export var systems = {};  // Keep track of registered systems.

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
 * @constructor
 * @param {Element} sceneEl - Handle to the scene element where system applies to.
 * @property {string} name - Name that system is registered under.
 */
export var System = function (sceneEl) {
  var component = components && components.components[this.name];

  // Set reference to scene.
  this.el = sceneEl;
  this.sceneEl = sceneEl;

  // Set reference to matching component (if exists).
  if (component) { component.Component.prototype.system = this; }

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
  update: function (oldData) { /* no-op */ },

  /**
   * Build data and call update handler.
   *
   * @private
   */
  updateProperties: function (rawData) {
    var oldData = this.data;
    if (Object.keys(this.schema).length === 0) { return; }
    this.buildData(rawData);
    this.update(oldData);
  },

  /**
   * Parse data.
   */
  buildData: function (rawData) {
    var schema = this.schema;
    if (Object.keys(schema).length === 0) { return; }
    rawData = rawData || window.HTMLElement.prototype.getAttribute.call(this.sceneEl, this.name);
    if (isSingleProp(schema)) {
      this.data = parseProperty(rawData, schema);
    } else {
      this.data = parseProperties(styleParser.parse(rawData) || {}, schema, false, this.name);
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
  pause: function () { /* no-op */ }
};

/**
 * Registers a system to A-Frame.
 *
 * @param {string} name - Component name.
 * @param {object} definition - Component property and methods.
 */
export function registerSystem (name, definition) {
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
  systems[name] = NewSystem;

  // Initialize systems for existing scenes
  if (ready.canInitializeElements) {
    for (i = 0; i < scenes.length; i++) { scenes[i].initSystem(name); }
  }
}
