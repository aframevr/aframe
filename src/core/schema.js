import * as utils from '../utils/index.js';
import * as PropertyTypes from './propertyTypes.js';

var debug = utils.debug;
var isValidDefaultValue = PropertyTypes.isValidDefaultValue;
var propertyTypes = PropertyTypes.propertyTypes;

var warn = debug('core:schema:warn');

/**
 * A schema is classified as a schema for a single property if:
 * - `type` is defined on the schema as a string.
 * - OR `default` is defined on the schema, as a reserved keyword.
 * - OR schema is empty.
 */
export function isSingleProperty (schema) {
  if ('type' in schema) {
    return typeof schema.type === 'string';
  }
  return 'default' in schema;
}

/**
 * Build step to schema to use `type` to inject default value, parser, and stringifier.
 *
 * @param {object} schema
 * @param {string} componentName
 * @returns {object} Schema.
 */
export function process (schema, componentName) {
  var propName;

  // For single property schema, run processPropDefinition over the whole schema.
  if (isSingleProperty(schema)) {
    return processPropertyDefinition(schema, componentName);
  }

  // For multi-property schema, run processPropDefinition over each property definition.
  for (propName in schema) {
    schema[propName] = processPropertyDefinition(schema[propName], componentName);
  }
  return schema;
}

/**
 * Inject default value, parser, stringifier for single property.
 *
 * @param {object} propDefinition
 * @param {string} componentName
 */
export function processPropertyDefinition (propDefinition, componentName) {
  var defaultVal = propDefinition.default;
  var isCustomType;
  var propType;
  var typeName = propDefinition.type;

  // Type inference.
  if (!propDefinition.type) {
    if (defaultVal !== undefined &&
        (typeof defaultVal === 'boolean' || typeof defaultVal === 'number')) {
      // Type inference.
      typeName = typeof defaultVal;
    } else if (Array.isArray(defaultVal)) {
      typeName = 'array';
    } else {
      // Fall back to string.
      typeName = 'string';
    }
  } else if (propDefinition.type === 'bool') {
    typeName = 'boolean';
  } else if (propDefinition.type === 'float') {
    typeName = 'number';
  }

  propType = propertyTypes[typeName];
  if (!propType) {
    warn('Unknown property type for component `' + componentName + '`: ' + typeName);
  }

  // Fill in parse and stringify using property types.
  isCustomType = !!propDefinition.parse;
  propDefinition.parse = propDefinition.parse || propType.parse;
  propDefinition.stringify = propDefinition.stringify || propType.stringify;
  propDefinition.equals = propDefinition.equals || propType.equals;
  propDefinition.isCacheable = propDefinition.isCacheable === true || propType.isCacheable;

  // Fill in type name.
  propDefinition.type = typeName;

  // Check that default value exists.
  if ('default' in propDefinition) {
    // Check that default values are valid.
    if (!isCustomType && !isValidDefaultValue(typeName, defaultVal)) {
      warn('Default value `' + defaultVal + '` does not match type `' + typeName +
           '` in component `' + componentName + '`');
    }
  } else {
    // Fill in default value.
    propDefinition.default = propType.default;
  }

  return propDefinition;
}

/**
 * Parse propData using schema. Use default values if not existing in propData.
 *
 * @param {object} propData - Unparsed properties.
 * @param {object} schema - Property types definition.
 * @param {boolean} getPartialData - Whether to return full component data or just the data
 *        with keys in `propData`.
 * @param {string } componentName - Name of the component, used for the property warning.
 * @param {boolean} silent - Suppress warning messages.
 */
export var parseProperties = (function () {
  var propNames = [];

  return function (propData, schema, getPartialData, componentName, silent) {
    var i;
    var propName;
    var propDefinition;
    var propValue;

    propNames.length = 0;
    for (propName in (getPartialData ? propData : schema)) {
      if (getPartialData && propData[propName] === undefined) { continue; }
      propNames.push(propName);
    }

    if (propData === null || typeof propData !== 'object') { return propData; }

    // Validation errors.
    for (propName in propData) {
      if (propData[propName] !== undefined && !schema[propName] && !silent) {
        warn('Unknown property `' + propName +
             '` for component/system `' + componentName + '`.');
      }
    }

    for (i = 0; i < propNames.length; i++) {
      propName = propNames[i];
      propDefinition = schema[propName];
      propValue = propData[propName];
      if (!(schema[propName])) { return; }
      propData[propName] = parseProperty(propValue, propDefinition);
    }

    return propData;
  };
})();

/**
 * Deserialize a single property.
 *
 * @param {any} value - The value to parse.
 * @param {object} propDefinition - The single property schema for the property.
 * @param {any} target - Optional target value to parse into (reuse).
 */
export function parseProperty (value, propDefinition, target) {
  // Use default value if value is falsy.
  if (value === undefined || value === null || value === '') {
    value = propDefinition.default;
    if (Array.isArray(value)) { value = value.slice(); }
  }
  // Invoke property type parser.
  return propDefinition.parse(value, propDefinition.default, target);
}

/**
 * Serialize a group of properties.
 */
export function stringifyProperties (propData, schema) {
  var propName;
  var propDefinition;
  var propValue;
  var stringifiedData = {};
  var value;

  for (propName in propData) {
    propDefinition = schema[propName];
    propValue = propData[propName];
    value = propValue;
    if (typeof value === 'object') {
      value = stringifyProperty(propValue, propDefinition);
      if (!propDefinition) { warn('Unknown component property: ' + propName); }
    }
    if (value !== undefined) {
      stringifiedData[propName] = value;
    }
  }
  return stringifiedData;
}

/**
 * Serialize a single property.
 */
export function stringifyProperty (value, propDefinition) {
  // This function stringifies but it's used in a context where
  // there's always second stringification pass. By returning the original
  // value when it's not an object we save one unnecessary call
  // to JSON.stringify.
  if (typeof value !== 'object') { return value; }
  // if there's no schema for the property we use standard JSON stringify
  if (!propDefinition || value === null) { return JSON.stringify(value); }
  return propDefinition.stringify(value);
}
