/* global assert, suite, test */
var Schema = require('core/schema');
var registerPropertyType = require('core/propertyTypes').registerPropertyType;

var isSingleProperty = Schema.isSingleProperty;
var parseProperties = Schema.parseProperties;
var parseProperty = Schema.parseProperty;
var processSchema = Schema.process;

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
        visible: {type: 'boolean'},
        width: {type: 'int', default: 2}
      });
      var parsed = parseProperties({
        position: '1 2 3',
        visible: 'false',
        width: '7'
      }, schema);

      assert.shallowDeepEqual(parsed, {
        position: {x: 1, y: 2, z: 3},
        scale: {x: 0, y: 0, z: 0},
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
});
