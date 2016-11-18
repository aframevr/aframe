var coordinates = require('../utils/coordinates');
var debug = require('debug');

var error = debug('core:propertyTypes:warn');
var warn = debug('core:propertyTypes:warn');

var propertyTypes = module.exports.propertyTypes = {};

// Built-in property types.
registerPropertyType('audio', '', assetParse);
registerPropertyType('array', [], arrayParse, arrayStringify);
registerPropertyType('asset', '', assetParse);
registerPropertyType('boolean', false, boolParse);
registerPropertyType('color', '#FFF', defaultParse, defaultStringify);
registerPropertyType('int', 0, intParse);
registerPropertyType('number', 0, numberParse);
registerPropertyType('map', '', assetParse);
registerPropertyType('model', '', assetParse);
registerPropertyType('selector', '', selectorParse, selectorStringify);
registerPropertyType('selectorAll', '', selectorAllParse, selectorAllStringify);
registerPropertyType('src', '', srcParse);
registerPropertyType('string', '', defaultParse, defaultStringify);
registerPropertyType('time', 0, intParse);
registerPropertyType('vec2', {x: 0, y: 0}, vecParse, coordinates.stringify);
registerPropertyType('vec3', {x: 0, y: 0, z: 0}, vecParse, coordinates.stringify);
registerPropertyType('vec4', {x: 0, y: 0, z: 0, w: 0}, vecParse, coordinates.stringify);
registerPropertyType('mat3', [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
], matParse, matStringify);
registerPropertyType('mat4', [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
], matParse, matStringify);

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

/**
 * For general assets.
 *
 * @param {string} value - Can either be `url(<value>)`, an ID selector to an asset, or
 *   just string.
 * @returns {string} Parsed value from `url(<value>)`, src from `<someasset src>`, or
 *   just string.
 */
function assetParse (value) {
  var el;
  var parsedUrl;

  // Wrapped `url()` in case of data URI.
  parsedUrl = value.match(/\url\((.+)\)/);
  if (parsedUrl) { return parsedUrl[1]; }

  // ID.
  if (value.charAt(0) === '#') {
    el = selectorParse(value);
    if (el) {
      if (el.tagName === 'CANVAS') {
        return el;
      } else {
        return el.getAttribute('src');
      }
    }
    warn('"' + value + '" asset not found.');
    return;
  }

  // Non-wrapped url().
  return value;
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

function srcParse (value) {
  warn('`src` property type is deprecated. Use `asset` instead.');
  return assetParse(value);
}

function vecParse (value) {
  return coordinates.parse(value, this.default);
}

/**
 * Parses a string of the form "n1 n2, n3 n4", returning an array in column-major format.
 * @param  {string} value
 * @return {Array<Number>}
 */
function matParse (value) {
  if (!value) { return this.default; }
  var rows = arrayParse(value).map(function (row) {
    return row.trim().replace(/\s+/g, ' ').split(' ').map(Number);
  });

  // Convert to column-major format.
  var elements = [];
  for (var i = 0; i < rows.length; i++) {
    for (var j = 0; j < rows[i].length; j++) {
      elements.push(rows[j][i]);
    }
  }
  return elements;
}

function matStringify (value) {
  var n = Math.sqrt(value.length);
  if (n % 1 !== 0) {
    warn('Invalid matrix dimensions.');
    return '';
  }

  // Group matrix values into rows.
  var rows = [];
  for (var i = 0; i < n; i++) {
    var row = [];
    for (var j = 0; j < n; j++) {
      row.push(value[i + j * n]);
    }
    rows.push(row.join(' '));
  }

  // Add comma-delimiter to rows.
  return arrayStringify(rows);
}
