var debug = require('../utils/debug');
var propertyTypes = require('./propertyTypes').propertyTypes;
var warn = debug('core:schema:warn');

/**
 * A schema is classified as a schema for a single property if:
 * - `type` is defined on the schema as a string.
 * - OR `default` is defined on the schema, as a reserved keyword.
 * - OR schema is empty.
 */
function isSingleProperty (schema) {
  if ('type' in schema) {
    return typeof schema.type === 'string';
  }
  return 'default' in schema || Object.keys(schema).length === 0;
}
module.exports.isSingleProperty = isSingleProperty;

/**
 * Build step to schema to use `type` to inject default value, parser, and stringifier.
 *
 * @param {object} schema
 * @returns {object} Schema.
 */
module.exports.process = function (schema) {
  // For single property schema, run processPropDefinition over the whole schema.
  if (isSingleProperty(schema)) {
    return processPropertyDefinition(schema);
  }

  // For multi-property schema, run processPropDefinition over each property definition.
  Object.keys(schema).forEach(function (propName) {
    schema[propName] = processPropertyDefinition(schema[propName]);
  });
  return schema;
};

/**
 * Inject default value, parser, stringifier for single property.
 */
function processPropertyDefinition (propDefinition) {
  var propType;
  var defaultVal = propDefinition.default;
  var typeName = propDefinition.type;

  // Type inference.
  if (!propDefinition.type) {
    if (defaultVal !== undefined && ['boolean', 'number'].indexOf(typeof defaultVal) !== -1) {
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
    warn('Unknown property type: ' + typeName);
  }

  // Fill in parse and stringify using property types.
  if (!propDefinition.parse) {
    propDefinition.parse = propType.parse;
  }
  if (!propDefinition.stringify) {
    propDefinition.stringify = propType.stringify;
  }

  // Fill in type name.
  propDefinition.type = typeName;

  // Fill in default value.
  if (!('default' in propDefinition)) {
    propDefinition.default = propType.default;
  }

  // Bind parse and stringify to the property definition.
  propDefinition.parse = propDefinition.parse.bind(propDefinition);
  propDefinition.stringify = propDefinition.stringify.bind(propDefinition);

  return propDefinition;
}
module.exports.processPropertyDefinition = processPropertyDefinition;

/**
 * Parse propData using schema. Use default values if not existing in propData.
 *
 * @param {object} propData - Unparsed properties.
 * @param {object} schema - Property types definition.
 * @param {boolean} getPartialData - Whether to return full component data or just the data
 *        with keys in `propData`.
 * @param {boolean} silent - Suppress warning messages.
 */
module.exports.parseProperties = function (propData, schema, getPartialData, silent) {
  var propNames = Object.keys(getPartialData ? propData : schema);

  if (propData === null || typeof propData !== 'object') { return propData; }

  // Validation errors.
  Object.keys(propData).forEach(function (propName) {
    if (!schema[propName] && !silent) {
      warn('Unknown component property: ' + propName);
    }
  });

  propNames.forEach(function (propName) {
    var propDefinition = schema[propName];
    var propValue = propData[propName];

    if (!(schema[propName])) { return; }

    propValue = propValue === undefined ? propDefinition.default : propValue;
    propData[propName] = parseProperty(propValue, propDefinition);
  });

  return propData;
};

function parseProperty (value, propDefinition) {
  if (typeof value !== 'string') { return value; }
  if (typeof value === 'undefined') { return value; }
  return propDefinition.parse(value);
}
module.exports.parseProperty = parseProperty;

module.exports.stringifyProperties = function (propData, schema) {
  var stringifiedData = {};
  Object.keys(propData).forEach(function (propName) {
    var propDefinition = schema[propName];
    var propValue = propData[propName];
    var value = propValue;
    if (typeof value === 'object') {
      value = stringifyProperty(propValue, propDefinition);
      if (!propDefinition) { warn('Unknown component property: ' + propName); }
    }
    stringifiedData[propName] = value;
  });
  return stringifiedData;
};

function stringifyProperty (value, propDefinition) {
  if (typeof value !== 'object') { return value; }
  // if there's no schema for the property we use standar JSON stringify
  if (!propDefinition) { return JSON.stringify(value); }
  return propDefinition.stringify(value);
}
module.exports.stringifyProperty = stringifyProperty;
