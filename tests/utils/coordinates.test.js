/* global assert, suite, test */
var coordinates = require('index').utils.coordinates;

suite('utils.coordinates', function () {
  suite('isCoordinate', function () {
    test('verifies valid vec3 coordinate', function () {
      assert.ok(coordinates.isCoordinate(' 1 2.5  -3'));
    });

    test('verifies valid vec3 coordinate with e-notation', function () {
      assert.ok(coordinates.isCoordinate('1.2e3 2.5 3.4e-5'));
    });

    test('verifies valid vec4 coordinate', function () {
      assert.ok(coordinates.isCoordinate('1 1 2.5 -3'));
    });

    test('rejects invalid coordinate', function () {
      assert.notOk(coordinates.isCoordinate('1 1 2.5 -3 0.1'));
    });
  });

  suite('parse', function () {
    test('parses string', function () {
      assert.shallowDeepEqual(
        coordinates.parse('1 2.5 -3'), {x: 1, y: 2.5, z: -3});
    });

    test('applies defaults to the missing values', function () {
      assert.deepEqual(
        coordinates.parse({x: 1}, {x: 0, y: 0, z: 0}), {x: 1, y: 0, z: 0});
    });

    test('parses null', function () {
      assert.equal(coordinates.parse(null), null);
    });

    test('can return fallback values', function () {
      var defaultCoordinate = {z: -3};
      assert.shallowDeepEqual(coordinates.parse('1 2', defaultCoordinate),
                              {x: 1, y: 2, z: -3});
    });

    test('returns already-parsed object', function () {
      assert.shallowDeepEqual(coordinates.parse({x: 1, y: 2, z: -3}),
                              {x: 1, y: 2, z: -3});
    });

    test('zero value of object won\'t be overriden by defaults', function () {
      assert.shallowDeepEqual(
        coordinates.parse({x: 0, y: 1}, {x: 4, y: 5, z: 6}),
        {x: 0, y: 1, z: 6});
    });

    test('parses object with strings', function () {
      assert.shallowDeepEqual(coordinates.parse({x: '1', y: '2', z: -3}),
                              {x: 1, y: 2, z: -3});
    });
  });

  suite('stringify', function () {
    test('stringifies a vec2', function () {
      assert.equal(coordinates.stringify({x: 1, y: 2}), '1 2');
    });

    test('stringifies a vec3', function () {
      assert.equal(coordinates.stringify({x: 1, y: 2, z: -3}), '1 2 -3');
    });

    test('stringifies a vec4', function () {
      assert.equal(coordinates.stringify({x: 1, y: 2, z: -3, w: -4}), '1 2 -3 -4');
    });

    test('returns already-stringified string', function () {
      assert.equal(coordinates.stringify('1 2 -3'), '1 2 -3');
    });
  });
});
