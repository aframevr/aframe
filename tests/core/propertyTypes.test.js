/* global assert, setup, suite, teardown, test */
'use strict';
var PropertyTypes = require('core/propertyTypes');

var propertyTypes = PropertyTypes.propertyTypes;
var register = PropertyTypes.registerPropertyType;

suite('propertyTypes', function () {
  suite('boolean', function () {
    var parse = propertyTypes.boolean.parse;
    var stringify = propertyTypes.boolean.stringify;

    test('parses false', function () {
      assert.equal(parse('false'), false);
      assert.equal(parse(false), false);
    });

    test('parses true', function () {
      assert.equal(parse('true'), true);
      assert.equal(parse(''), true);
    });

    test('stringifies false', function () {
      assert.equal(stringify(false), 'false');
      assert.equal(stringify(true), 'true');
    });
  });

  suite('registerPropertyType', function () {
    test('registers type', function () {
      assert.notOk('mytype' in propertyTypes);
      register('mytype', 5);
      assert.ok('mytype' in propertyTypes);
      assert.equal(propertyTypes.mytype.default, 5);
    });
  });

  suite('selector', function () {
    var parse = propertyTypes.selector.parse;
    var stringify = propertyTypes.selector.stringify;

    setup(function () {
      var el = this.el = document.createElement('div');
      el.setAttribute('id', 'hello');
      el.setAttribute('class', 'itsme');
      document.body.appendChild(el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('parses valid selector', function () {
      assert.equal(parse('#hello.itsme'), this.el);
    });

    test('parses null selector', function () {
      assert.equal(parse('#goodbye'), null);
    });

    test('stringifies valid selector', function () {
      assert.equal(stringify(this.el), '#hello');
    });
  });

  suite('array', function () {
    var parse = propertyTypes.array.parse;
    var stringify = propertyTypes.array.stringify;

    test('parses array', function () {
      assert.deepEqual(parse(''), []);
      assert.deepEqual(parse('5,test, 5 0 5           '), ['5', 'test', '5 0 5']);
      assert.deepEqual(parse([]), []);
      assert.deepEqual(parse([1, 'five', null]), [1, 'five', null]);
    });

    test('stringifies array', function () {
      assert.equal(stringify([]), '');
      assert.equal(stringify([5, 10]), '5, 10');
      assert.equal(stringify([1, 'five', true, '5 0 5']), '1, five, true, 5 0 5');
    });
  });
});
