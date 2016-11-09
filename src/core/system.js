var componentModule = require('./component');
var utils = require('../utils');

var Component = componentModule.Component;
var components = componentModule.components;

var systems = module.exports.systems = {};  // Keep track of registered systems.

/**
 * System constructor. Extends the Component constructor.
 *
 * Systems provide global scope and services to a group of instantiated components of the
 * same class. They can also help abstract logic away from components such that components
 * only have to worry about data.
 * For example, a physics component that creates a physics world that oversees
 * all entities with a physics or rigid body component.
 *
 * @member {string} name - Name that system is registered under.
 * @member {Element} sceneEl - Handle to the scene element where system applies to.
 */
var System = module.exports.System = function (el, attrName, id) {
  Component.call(this, el, attrName, id);

  // Set reference to matching component (if exists).
  if (components[attrName]) { components[attrName].Constructor.prototype.system = this; }
};

// System prototype. Extends the Component prototype.
System.prototype = utils.extendDeep({}, Component.prototype);

/**
 * Register system to A-Frame.
 *
 * @param {string} name - System name.
 * @param {object} definition - System property and methods.
 * @returns {object} System.
 */
module.exports.registerSystem = function (name, definition) {
  var NewSystem;
  var entry;
  var i;
  var scenes;

  // System constructor.
  NewSystem = function (el, attrName, id) {
    System.call(this, el, attrName, id);
  };
  NewSystem.prototype = utils.createPrototype(name, definition, System.prototype, 'system',
                                              systems);
  entry = componentModule.registerComponentConstructor(name, NewSystem, systems);

  // Initialize systems for already-running scenes.
  scenes = utils.findAllScenes(document);
  for (i = 0; i < scenes.length; i++) { scenes[i].initSystem(name); }

  return entry;
};
