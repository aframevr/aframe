var coordinates = require('../utils/coordinates');
var debug = require('debug');

var error = debug('core:propertyTypes:warn');

var propertyTypes = module.exports.propertyTypes = {};

// Built-in property types.
registerPropertyType('boolean', false, boolParse);
registerPropertyType('int', 0, intParse);
registerPropertyType('number', 0, numberParse);
registerPropertyType('selector', '', selectorParse, selectorStringify);
registerPropertyType('string', '', defaultParse, defaultStringify);
registerPropertyType('vec3', { x: 0, y: 0, z: 0 }, coordinates.parse, coordinates.stringify);

/**
 * Register a parser for re-use such that when someone uses `type` in the schema,
 * `schema.process` will set the property `parse` and `stringify`.
 *
 * @param {string} type - Type name.
 * @param [defaultValue=null] -
 *   Default value to use if component does not define default value.
 * @param {function} [parse=defaultParse] - Parse string function.
 * @param {function} [stringify=defaultStringify] - Stringify to DOM function.
 */
function registerPropertyType (type, defaultValue, parse, stringify) {
  if ('type' in propertyTypes) {
    error('Property type "' + type + '" is already registered.');
    return;
  }

  propertyTypes[type] = {
    default: defaultValue,
    parse: parse || defaultParse,
    stringify: stringify || defaultStringify
  };
}
module.exports.registerPropertyType = registerPropertyType;

function defaultParse (value) {
  return value;
}

function defaultStringify (value) {
  return value.toString();
}

function boolParse (value) {
  return value !== 'false' && value !== false;
}

function intParse (value) {
  return parseInt(value, 10);
}

function numberParse (value) {
  return parseFloat(value, 10);
}

function selectorParse (value) {
  if (!value) { return null; }
  if (typeof value !== 'string') { return value; }
  return document.querySelector(value);
}

function selectorStringify (el) {
  // Currently no way to infer the selector used for this component.
  if (el) { return '#' + el.getAttribute('id'); }
  return '';
}
