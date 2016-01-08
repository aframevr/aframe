/* global assert, suite, test */
'use strict';
var coerce = require('index').utils.coerce;

suite('utils.coerce', function () {
  suite('coerces object', function () {
    test('with a bool', function () {
      assert.shallowDeepEqual(coerce(
        { doubleSided: 'true' },
        { doubleSided: { default: false } }
      ), { doubleSided: true });
    });

    test('with a number', function () {
      assert.shallowDeepEqual(coerce(
        { radius: '5.5' },
        { radius: { default: 1 } }
      ), { radius: 5.5 });
    });

    test('with already-coerced values', function () {
      assert.shallowDeepEqual(coerce(
        { doubleSided: true, radius: 5.5 },
        { doubleSided: false, radius: 1 }
      ), { doubleSided: true, radius: 5.5 });
    });

    test('with a coordinate', function () {
      assert.shallowDeepEqual(coerce(
        '-1 2.5 3',
        { default: { x: 0, y: 0, z: 0 } }
      ), { x: -1, y: 2.5, z: 3 });
    });
  });

  suite('coerces string', function () {
    test('with a bool', function () {
      assert.equal(coerce('true', { default: false }), true);
    });

    test('with a number', function () {
      assert.equal(coerce('5.5', { radius: { default: 1 } }, 'radius'), 5.5);
    });

    test('with already-coerced values', function () {
      assert.equal(coerce(true, { doubleSided: { default: false } }, 'anything'), true);
      assert.equal(coerce(5.5, { radius: { default: 1 } }, 'anything'), 5.5);
    });

    test('with a coordinate', function () {
      assert.shallowDeepEqual(coerce(
        '-1 2.5 3',
        { default: { x: 0, y: 0, z: 0 } }
      ), { x: -1, y: 2.5, z: 3 });
    });
  });
});
