/* global assert, suite, test */
var Schema = require('core/schema');
var registerPropertyType = require('core/propertyTypes').registerPropertyType;

var isSingleProperty = Schema.isSingleProperty;
var parseProperties = Schema.parseProperties;
var parseProperty = Schema.parseProperty;
var processSchema = Schema.process;
var stringifyProperty = Schema.stringifyProperty;
var isValidDefaultCoordinate = Schema.isValidDefaultCoordinate;
var isValidDefaultValue = Schema.isValidDefaultValue;

suite('schema', function () {
  suite('isSingleProperty', function () {
    test('for empty object', function () {
      assert.notOk(isSingleProperty({}));
    });

    test('for type defined', function () {
      assert.ok(isSingleProperty({type: 'vec3'}));
    });

    test('for property named type', function () {
      assert.notOk(isSingleProperty({
        type: {default: ''}
      }));
    });

    test('for properties named type and default', function () {
      assert.notOk(isSingleProperty({
        type: {default: ''},
        default: {default: 5}
      }));
    });

    test('for default defined', function () {
      assert.ok(isSingleProperty({
        default: 5
      }));
    });

    test('for type and default defined', function () {
      assert.ok(isSingleProperty({
        type: 'vec3',
        default: '1 1 1'
      }));
    });
  });

  suite('parseProperty', function () {
    test('can parse using built-in property type', function () {
      var schemaPropDef = processSchema({type: 'vec3'});
      var parsed = parseProperty('1 2 3', schemaPropDef);
      assert.shallowDeepEqual(parsed, {x: 1, y: 2, z: 3});
    });

    test('uses default value if value is falsy', function () {
      var schemaPropDef = processSchema({type: 'int', default: 2});
      assert.equal(parseProperty(null, schemaPropDef), 2);
      assert.equal(parseProperty('', schemaPropDef), 2);
      assert.equal(parseProperty(undefined, schemaPropDef), 2);
      assert.equal(parseProperty(0, schemaPropDef), 0);
    });

    test('can parse using inline parse', function () {
      var schemaPropDef = {
        default: 'xyz',
        parse: function (val) { return val.toUpperCase(); }
      };
      var parsed = parseProperty('abc', schemaPropDef);
      assert.equal(parsed, 'ABC');
    });

    test('returns already-parsed value', function () {
      var schemaPropDef = processSchema({type: 'vec3'});
      var parsed = parseProperty({x: 0, y: 0, z: 0}, schemaPropDef);
      assert.shallowDeepEqual(parsed, {x: 0, y: 0, z: 0});
    });

    test('allows undefined default', function () {
      var schemaPropDef = processSchema({type: 'vec3', default: undefined});
      var parsed = parseProperty(undefined, schemaPropDef);
      assert.shallowDeepEqual(parsed, undefined);
    });
  });

  suite('parseProperties', function () {
    test('parses multiple properties', function () {
      var schema = processSchema({
        position: {type: 'vec3', default: {x: 0, y: 0, z: 0}},
        scale: {type: 'vec3', default: '0 0 0'},
        src: {type: 'asset'},
        visible: {type: 'boolean'},
        width: {type: 'int', default: 2}
      });
      var parsed = parseProperties({
        position: '1 2 3',
        src: 'url(test.png)',
        visible: 'false',
        width: '7'
      }, schema);

      assert.shallowDeepEqual(parsed, {
        position: {x: 1, y: 2, z: 3},
        scale: {x: 0, y: 0, z: 0},
        src: 'test.png',
        visible: false,
        width: 7
      });
    });

    test('inserts default for missing properties', function () {
      var schema = processSchema({
        position: {type: 'vec3', default: {x: 0, y: 0, z: 0}},
        scale: {type: 'vec3', default: '0 0 0'}
      });
      var parsed = parseProperties({}, schema);

      assert.shallowDeepEqual(parsed, {
        position: {x: 0, y: 0, z: 0},
        scale: {x: 0, y: 0, z: 0}
      });
    });
  });

  suite('processPropertyDefinition', function () {
    test('adds string type if not specified', function () {
      var definition = processSchema({});
      assert.ok(typeof definition.parse, 'function');
      assert.ok(typeof definition.stringify, 'function');
    });

    test('adds bool type if default value is bool', function () {
      var definition = processSchema({default: false});
      assert.equal(definition.type, 'boolean');
      assert.ok(typeof definition.parse, 'function');
      assert.ok(typeof definition.stringify, 'function');
    });

    test('adds number type if default value is number', function () {
      var definition = processSchema({default: 2.5});
      assert.equal(definition.type, 'number');
      assert.ok(typeof definition.parse, 'function');
      assert.ok(typeof definition.stringify, 'function');
    });

    test('adds array type if default value is array', function () {
      var definition = processSchema({default: [5, 10, 'fifty']});
      assert.equal(definition.type, 'array');
      assert.ok(typeof definition.parse, 'function');
      assert.ok(typeof definition.stringify, 'function');
    });

    test('sets default value if not defined', function () {
      registerPropertyType('faketype', 'FAKEDEFAULT');
      var definition = processSchema({type: 'faketype'});
      assert.equal(definition.default, 'FAKEDEFAULT');
    });

    test('preserves custom parse/stringify', function () {
      var parse = function (value) {
        return value.split('');
      };
      var definition = processSchema({
        default: 'abc',
        parse: parse
      });
      assert.equal(definition.type, 'string');
      assert.shallowDeepEqual(definition.parse('def'), parse('def'));
      assert.ok(typeof definition.stringify, 'function');
    });
  });

  suite('processSchema', function () {
    test('processes all property definitions', function () {
      registerPropertyType('faketype', 'FAKEDEFAULT');

      var schema = processSchema({
        type: {default: 'directional'},
        boolean: {default: false},
        position: {type: 'vec3'}
      });

      Object.keys(schema).forEach(function (propName) {
        var propDefinition = schema[propName];
        assert.ok(propDefinition.type);
        assert.ok('default' in propDefinition);
        assert.equal(typeof propDefinition.parse, 'function');
        assert.equal(typeof propDefinition.stringify, 'function');
      });
    });
  });

  suite('stringifyProperty', function () {
    test('returns input if input is not an object', function () {
      var parsedValue = stringifyProperty(5, {stringify: JSON.stringify});
      assert.equal(parsedValue, 5);
    });

    test('returns parsed input if input is an object', function () {
      var parsedValue = stringifyProperty({x: 5}, {stringify: JSON.stringify});
      assert.equal(parsedValue, '{"x":5}');
    });

    test('returns parsed input if input is null', function () {
      var parsedValue = stringifyProperty(null, {stringify: JSON.stringify});
      assert.equal(parsedValue, 'null');
    });
  });

  suite('isValidDefaultCoordinate', function () {
    test('is true for null', function () {
      assert.equal(isValidDefaultCoordinate(null, 2), true);
    });
    test('is true for vec2 if { x: num, y:num }', function () {
      var validCoordinates = { x: 1, y: 2 };
      assert.equal(isValidDefaultCoordinate(validCoordinates, 2), true);
    });

    test('is true for vec3 if { x: num, y:num z: num }', function () {
      var validCoordinates = { x: 1, y: 2, z: 3 };
      assert.equal(isValidDefaultCoordinate(validCoordinates, 3), true);
    });

    test('is true for vec4 if { x: num, y:num z: num w: num }', function () {
      var validCoordinates = { x: 1, y: 2, z: 3, w: 4 };
      assert.equal(isValidDefaultCoordinate(validCoordinates, 4), true);
    });

    test('is false for everything else', function () {
      var invalidCoordinates1 = { notX: 1 };
      var invalidCoordinates2 = { x: '' };
      var invalidCoordinates3 = { x: 0, z: 5 };
      var invalidCoordinates4 = { x: 5, y: {} };
      var invalidCoordinates5 = { x: 1, y: [] };
      var invalidCoordinates6 = { notX: 'not coordinates at all' };
      var invalidCoordinates7 = { x: 5, y: 1, z: 2 }; // Invalid for vec4
      assert.equal(isValidDefaultCoordinate(invalidCoordinates1, 2), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates2, 2), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates3, 2), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates4, 3), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates5, 4), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates6, 4), false);
      assert.equal(isValidDefaultCoordinate(invalidCoordinates7, 4), false);
    });
  });

  suite('isValidDefaultValue', function () {
    test('is true when type and typeof default value matches', function () {
      assert.equal(isValidDefaultValue('audio', 'string'), true);
      assert.equal(isValidDefaultValue('array', []), true);
      assert.equal(isValidDefaultValue('asset', 'string'), true);
      assert.equal(isValidDefaultValue('boolean', true), true);
      assert.equal(isValidDefaultValue('color', '#FFF'), true);
      assert.equal(isValidDefaultValue('int', 9000), true);
      assert.equal(isValidDefaultValue('number', 42), true);
      assert.equal(isValidDefaultValue('map', 'string'), true);
      assert.equal(isValidDefaultValue('model', 'string'), true);
      assert.equal(isValidDefaultValue('selector', 'string'), true);
      assert.equal(isValidDefaultValue('selectorAll', 'string'), true);
      assert.equal(isValidDefaultValue('src', 'string'), true);
      assert.equal(isValidDefaultValue('string', 'string'), true);
      assert.equal(isValidDefaultValue('time', 24), true);
      assert.equal(isValidDefaultValue('vec2', { x: 1, y: 1 }), true);
      assert.equal(isValidDefaultValue('vec3', { x: 0, y: 9, z: 0 }), true);
      assert.equal(isValidDefaultValue('vec4', { x: 9, y: 9, z: 9, w: 9 }), true);
      assert.equal(isValidDefaultValue('vec4', null), true);
    });

    test('is false for everything else', function () {
      assert.equal(isValidDefaultValue('audio', 1), false);
      assert.equal(isValidDefaultValue('array', {}), false);
      assert.equal(isValidDefaultValue('asset', 2), false);
      assert.equal(isValidDefaultValue('boolean', { not: 'a boolean' }), false);
      assert.equal(isValidDefaultValue('color', 123456), false);
      assert.equal(isValidDefaultValue('int', 'not a number'), false);
      assert.equal(isValidDefaultValue('number', ['something else']), false);
      assert.equal(isValidDefaultValue('map', 3), false);
      assert.equal(isValidDefaultValue('model', 4), false);
      assert.equal(isValidDefaultValue('selector', 5), false);
      assert.equal(isValidDefaultValue('selectorAll', 6), false);
      assert.equal(isValidDefaultValue('src', 7), false);
      assert.equal(isValidDefaultValue('string', 8), false);
      assert.equal(isValidDefaultValue('time', 'string'), false);
      assert.equal(isValidDefaultValue('vec2', [1, 2, 3]), false);
      assert.equal(isValidDefaultValue('vec3', undefined), false);
      assert.equal(isValidDefaultValue('vec4', false), false);
    });
  });
});
