/* global assert, suite, test */
'use strict';
var coordinates = require('index').utils.coordinates;

suite('utils.coordinates', function () {
  suite('isCoordinate', function () {
    test('verifies valid coordinate', function () {
      assert.ok(coordinates.isCoordinate(' 1 2.5  -3'));
    });

    test('rejects invalid coordinate', function () {
      assert.ok(coordinates.isCoordinate('1 1 2.5 -3'));
    });
  });

  suite('parse', function () {
    test('parses string', function () {
      assert.shallowDeepEqual(
        coordinates.parse('1 2.5 -3'), { x: 1, y: 2.5, z: -3 });
    });

    test('parses null', function () {
      assert.equal(coordinates.parse(null), null);
    });

    test('can return fallback values', function () {
      assert.shallowDeepEqual(coordinates.parse('1 2', { z: { default: -3 } }), { x: 1, y: 2, z: -3 });
    });

    test('returns already-parsed object', function () {
      assert.shallowDeepEqual(coordinates.parse({ x: 1, y: 2, z: -3 }),
                              { x: 1, y: 2, z: -3 });
    });
  });

  suite('stringify', function () {
    test('stringifies object', function () {
      assert.equal(coordinates.stringify({ x: 1, y: 2, z: -3 }), '1 2 -3');
    });

    test('returns already-stringified string', function () {
      assert.equal(coordinates.stringify('1 2 -3'), '1 2 -3');
    });
  });
});
