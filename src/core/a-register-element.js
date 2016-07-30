/*
  ------------------------------------------------------------
  ------------- WARNING WARNING WARNING WARNING --------------
  ------------------------------------------------------------

  This module wraps registerElement to deal with components that inherit from
  `ANode` and `AEntity`.  It's a pass through in any other case.

  It wraps some of the prototype methods of the created element to make sure
  that the corresponding functions in the base prototypes (`AEntity` and `ANode`)
  are also invoked. The method in the base prototype is always called before the one
  in the derived prototype.
*/

// Polyfill `document.registerElement`.
require('document-register-element');

var ANode;  // Must declare before AEntity. Initialized at the bottom.
var AEntity;
var knownTags = module.exports.knownTags = {};

function addTagName (tagName) {
  knownTags[tagName.toLowerCase()] = true;
}

/**
 * Return whether the element type is one of our known registered ones.
 *
 * @param {string} node - The name of the tag to register.
 * @returns {boolean} Whether the tag name matches that of our registered custom elements.
 */
module.exports.isNode = function (node) {
  return node.tagName.toLowerCase() in knownTags || node.isNode;
};

/**
 * @param {string} tagName - The name of the tag to register.
 * @param {object} obj - The prototype of the new element.
 * @returns {object} The prototype of the new element.
 */
module.exports.registerElement = function (tagName, obj) {
  var proto = Object.getPrototypeOf(obj.prototype);
  var newObj = obj;
  var isANode = ANode && proto === ANode.prototype;
  var isAEntity = AEntity && proto === AEntity.prototype;

  if (isANode || isAEntity) { addTagName(tagName); }

  // Wrap if element inherits from `ANode`.
  if (isANode) {
    newObj = wrapANodeMethods(obj.prototype);
    newObj = {prototype: Object.create(proto, newObj)};
  }

  // Wrap if element inherits from `AEntity`.
  if (isAEntity) {
    newObj = wrapAEntityMethods(obj.prototype);
    newObj = {prototype: Object.create(proto, newObj)};
  }

  return document.registerElement(tagName, newObj);
};

/**
 * Wrap some obj methods to call those on `ANode` base prototype.
 *
 * @param {object} obj - Object that contains the methods that will be wrapped.
 * @return {object} An object with the same properties as the input parameter but
 * with some of methods wrapped.
 */
function wrapANodeMethods (obj) {
  var newObj = {};
  var ANodeMethods = [
    'attachedCallback',
    'attributeChangedCallback',
    'createdCallback'
  ];
  wrapMethods(newObj, ANodeMethods, obj, ANode.prototype);
  copyProperties(obj, newObj);
  return newObj;
}

/**
 * This wraps some of the obj methods to call those on `AEntity` base prototype.
 *
 * @param {object} obj - The objects that contains the methods that will be wrapped.
 * @return {object} - An object with the same properties as the input parameter but
 * with some of methods wrapped.
 */
function wrapAEntityMethods (obj) {
  var newObj = {};
  var ANodeMethods = [
    'attachedCallback',
    'attributeChangedCallback',
    'createdCallback'
  ];
  var AEntityMethods = [
    'attachedCallback',
    'attributeChangedCallback',
    'createdCallback',
    'detachedCallback'
  ];

  wrapMethods(newObj, ANodeMethods, obj, ANode.prototype);
  wrapMethods(newObj, AEntityMethods, obj, AEntity.prototype);
  // Copies the remaining properties into the new object.
  copyProperties(obj, newObj);
  return newObj;
}

/**
 * Wrap a list a methods to ensure that those in the base prototype are called
 * before the derived one.
 *
 * @param {object} targetObj - Object that will contain the wrapped methods.
 * @param {array} methodList - List of methods from the derivedObj that will be wrapped.
 * @param {object} derivedObject - Object that inherits from the baseObj.
 * @param {object} baseObj - Object that derivedObj inherits from.
 */
function wrapMethods (targetObj, methodList, derivedObj, baseObj) {
  methodList.forEach(function (methodName) {
    wrapMethod(targetObj, methodName, derivedObj, baseObj);
  });
}
module.exports.wrapMethods = wrapMethods;

/**
 * Wrap one method to ensure that the one in the base prototype is called before
 * the one in the derived one.
 *
 * @param {object} obj - Object that will contain the wrapped method.
 * @param {string} methodName - The name of the method that will be wrapped.
 * @param {object} derivedObject - Object that inherits from the baseObj.
 * @param {object} baseObj - Object that derivedObj inherits from.
 */
function wrapMethod (obj, methodName, derivedObj, baseObj) {
  var derivedMethod = derivedObj[methodName];
  var baseMethod = baseObj[methodName];

  // Derived prototype does not define method, no need to wrap.
  if (!derivedMethod || !baseMethod) { return; }

  // Derived prototype doesn't override the one in the base one, no need to wrap.
  if (derivedMethod === baseMethod) { return; }

  // Wrap to ensure the base method is called before the one in the derived prototype.
  obj[methodName] = {
    value: function wrappedMethod () {
      baseMethod.apply(this, arguments);
      return derivedMethod.apply(this, arguments);
    },
    writable: window.debug
  };
}

/**
 * It copies the properties from source to destination object if they don't
 * exist already.
 *
 * @param {object} source - The object where properties are copied from.
 * @param {type} destination - The object where properties are copied to.
 */
function copyProperties (source, destination) {
  var props = Object.getOwnPropertyNames(source);
  props.forEach(function (prop) {
    var desc;
    if (!destination[prop]) {
      desc = Object.getOwnPropertyDescriptor(source, prop);
      destination[prop] = {value: source[prop], writable: desc.writable};
    }
  });
}

ANode = require('./a-node');
AEntity = require('./a-entity');
