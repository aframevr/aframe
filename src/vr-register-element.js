// Polyfill `document.registerElement`.
require('document-register-element');

/*
 ------------------------------------------------------------
 ------------- WARNING WARNING WARNING WARNING --------------
 ------------------------------------------------------------

 This module wraps registerElement to deal with
 components that inherit from VRNode and VRObject.
 It's a pass through in any other case.

 It wraps some of the prototype methods
 of the created element to make sure that the corresponding
 functions in the base classes (VRObject and VRNode) are also
 invoked. The method in the base class is always call before the
 one in the derived object.

*/
var registerElement = document.registerElement;

/**
 * @param  {string} tagName The name of the tag to register
 * @param  {object} obj The prototype of the new element
 * @return {object} The prototype of the new element
 */
document.registerElement = function(tagName, obj) {
	var proto;
	var newObj = obj;
	proto = obj.prototype.__proto__; // jshint ignore:line

	// Does the element inherit from VRNode?
	if (VRNode && proto === VRNode.prototype) {
		newObj = wrapVRNodeMethods(obj.prototype);
		newObj = { prototype: Object.create(proto, newObj) };
	}

	// Does the element inherit from VRObject?
	if (VRObject && proto === VRObject.prototype) {
		newObj = wrapVRObjectMethods(obj.prototype);
		newObj = { prototype: Object.create(proto, newObj) };
	}

	return registerElement.call(document, tagName, newObj);
};

/**
 * This wrapps some of the obj methods to call those on VRNode base clase
 * @param  {object} obj The objects that contains the methods that will be wrapped
 * @return {object} An object with the same properties as the input parameter but
 * with some of methods wrapped.
 */
function wrapVRNodeMethods(obj) {
	var newObj = {};
	wrapMethods(newObj, ['createdCallback'], obj, VRNode.prototype);
	copyProperties(obj, newObj);
	return newObj;
}

/**
 * This wrapps some of the obj methods to call those on VRObject base clase
 * @param  {object} obj The objects that contains the methods that will be wrapped
 * @return {object} An object with the same properties as the input parameter but
 * with some of methods wrapped.
 */
function wrapVRObjectMethods(obj) {
	var newObj = {};
	var vrNodeMethods = ['createdCallback'];
	var vrObjectMethods =
		['attributeChangedCallback', 'attachedCallback', 'dettachedCallback'];
	wrapMethods(newObj, vrNodeMethods, obj, VRNode.prototype);
	wrapMethods(newObj, vrObjectMethods, obj, VRObject.prototype);
	// Copies the remaining properties into the new object
	copyProperties(obj, newObj);
	return newObj;
}

/**
 * Wraps a list a methods to ensure that those in the base class are called through the derived one
 * @param  {object} targetObj Object that will contain the wrapped methods
 * @param  {array} methodList List of methods from the derivedObj that will be wrapped
 * @param  {object} derivedObject Object that inherits from the baseObj
 * @param  {object} baseObj Object that derivedObj inherits from
 * @return {undefined}
 */
function wrapMethods(targetObj, methodList, derivedObj, baseObj) {
	methodList.forEach(function(methodName){
		wrapMethod(targetObj, methodName, derivedObj, baseObj);
	});
}

/**
 * Wraps one method to ensure that the one in the base class is called before the one
 * in the derived one
 * @param  {object} obj Object that will contain the wrapped method
 * @param  {string} methodName The name of the method that will be wrapped
 * @param  {object} derivedObject Object that inherits from the baseObj
 * @param  {object} baseObj Object that derivedObj inherits from
 * @return {undefined}
 */
function wrapMethod(obj, methodName, derivedObj, baseObj) {
	var derivedMethod = derivedObj[methodName];
	var baseMethod = baseObj[methodName];
	if (!derivedMethod || !baseMethod) { return; }
	// Wrapper
	// The base method is called before the one in the derived class
	var wrapperMethod = function() {
		baseMethod.apply(this, arguments);
		return derivedMethod.apply(this, arguments);
	};
	obj[methodName] = { value: wrapperMethod };
}

/**
 * It copies the properties from source to destination object
 * if they don't exist already
 * @param  {object} source The object where properties are copied from
 * @param  {[type]} destination The object where properties are copied to
 * @return {undefined}
 */
function copyProperties(source, destination) {
	var props = Object.getOwnPropertyNames(source);
	props.forEach(function(prop){
		if (!destination[prop]) {
			destination[prop] = { value: source[prop] };
		}
	});
}

var VRNode = require('./core/vr-node');
var VRObject = require('./core/vr-object');