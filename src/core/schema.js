var debug = require('debug');
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

  if (!propDefinition.type) {
    if (defaultVal !== undefined && ['boolean', 'number'].indexOf(typeof defaultVal) !== -1) {
      // Type inference.
      typeName = typeof defaultVal;
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
    return propDefinition;
  }

  if (!propDefinition.parse) {
    propDefinition.parse = propType.parse;
  }
  if (!propDefinition.stringify) {
    propDefinition.stringify = propType.stringify;
  }
  propDefinition.type = typeName;
  if (!('default' in propDefinition)) {
    propDefinition.default = propType.default;
  }

  return propDefinition;
}
module.exports.processPropertyDefinition = processPropertyDefinition;

/**
 * If `value` is object, parse values of `val` into types defined by `schema`.
 *
 * @param {object|string} value - value(s) to coerce.
 * @param {object} schema - Object which values will be used to coerce to.
 * @returns Coerced value or object.
 */
module.exports.parseProperties = function (propData, schema) {
  Object.keys(schema).forEach(function (propName) {
    var propDefinition = schema[propName];
    if (!propDefinition) {
      warn('Unknown component property: ' + propName);
      return;
    }

    var propValue = propData[propName];
    propValue = propValue === undefined ? propDefinition.default : propValue;
    propData[propName] = parseProperty(propValue, propDefinition);
  });

  return propData;
};

function parseProperty (value, propDefinition) {
  // Already parsed by component `buildData` setting default value.
  // TODO: Move that logic to the schema.
  if (typeof value !== 'string') { return value; }
  if (typeof value === 'undefined') { return value; }
  return propDefinition.parse(value);
}
module.exports.parseProperty = parseProperty;
