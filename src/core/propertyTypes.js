var coordinates = require('../utils/coordinates');
var debug = require('debug');

var error = debug('core:propertyTypes:warn');
var warn = debug('core:propertyTypes:warn');

var propertyTypes = module.exports.propertyTypes = {};

// Built-in property types.
registerPropertyType('array', [], arrayParse, arrayStringify);
registerPropertyType('boolean', false, boolParse);
registerPropertyType('color', '#FFF', defaultParse, defaultStringify);
registerPropertyType('int', 0, intParse);
registerPropertyType('number', 0, numberParse);
registerPropertyType('selector', '', selectorParse, selectorStringify);
registerPropertyType('selectorAll', '', selectorAllParse, selectorAllStringify);
registerPropertyType('src', '', srcParse);
registerPropertyType('string', '', defaultParse, defaultStringify);
registerPropertyType('time', 0, intParse);
registerPropertyType('vec2', {x: 0, y: 0}, vecParse, coordinates.stringify);
registerPropertyType('vec3', {x: 0, y: 0, z: 0}, vecParse, coordinates.stringify);
registerPropertyType('vec4', {x: 0, y: 0, z: 0, w: 0}, vecParse, coordinates.stringify);

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
    error('Property type ' + type + ' is already registered.');
    return;
  }

  propertyTypes[type] = {
    default: defaultValue,
    parse: parse || defaultParse,
    stringify: stringify || defaultStringify
  };
}
module.exports.registerPropertyType = registerPropertyType;

function arrayParse (value) {
  if (Array.isArray(value)) { return value; }
  if (!value || typeof value !== 'string') { return []; }
  return value.split(',').map(trim);
  function trim (str) { return str.trim(); }
}

function arrayStringify (value) {
  return value.join(', ');
}

function defaultParse (value) {
  return value;
}

function defaultStringify (value) {
  if (value === null) { return 'null'; }
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

function selectorAllParse (value) {
  if (!value) { return null; }
  if (typeof value !== 'string') { return value; }
  return Array.prototype.slice.call(document.querySelectorAll(value), 0);
}

function selectorStringify (value) {
  if (value.getAttribute) {
    return '#' + value.getAttribute('id');
  }
  return defaultStringify(value);
}

function selectorAllStringify (value) {
  if (value instanceof Array) {
    return value.map(function (element) {
      return '#' + element.getAttribute('id');
    }).join(', ');
  }
  return defaultStringify(value);
}

/**
 * `src` parser for assets.
 *
 * @param {string} value - Can either be `url(<value>)` or a selector to an asset.
 * @returns {string} Parsed value from `url(<value>)` or src from `<someasset src>`.
 */
function srcParse (value) {
  var parsedUrl = value.match(/\url\((.+)\)/);
  if (parsedUrl) { return parsedUrl[1]; }

  var el = selectorParse(value);
  if (el) { return el.getAttribute('src'); }

  if (value.charAt(0) !== '#') {
    warn('"' + value + '" is not a valid `src` attribute. ' +
         'Value must be an ID selector (i.e. "#someElement") or wrapped in `url()`.');
  }

  return '';
}

function vecParse (value) {
  return coordinates.parse(value, this.default);
}
