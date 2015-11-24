/* global assert, suite, test */
'use strict';
var coerce = require('aframe-core').utils.coerce;

suite('utils.coerce', function () {
  suite('coerces object', function () {
    test('with a bool', function () {
      assert.shallowDeepEqual(coerce(
        { doubleSided: 'true' },
        { doubleSided: false }
      ), { doubleSided: true });
    });

    test('with a number', function () {
      assert.shallowDeepEqual(coerce(
        { radius: '5.5' },
        { radius: 1 }
      ), { radius: 5.5 });
    });

    test('with already-coerced values', function () {
      assert.shallowDeepEqual(coerce(
        { doubleSided: true, radius: 5.5 },
        { doubleSided: false, radius: 1 }
      ), { doubleSided: true, radius: 5.5 });
    });
  });

  suite('coerces string', function () {
    test('with a bool', function () {
      assert.equal(coerce('true', { doubleSided: false }, 'doubleSided'), true);
    });

    test('with a number', function () {
      assert.equal(coerce('5.5', { radius: 1 }, 'radius'), 5.5);
    });

    test('with already-coerced values', function () {
      assert.equal(coerce(true, { doubleSided: false }, 'anything'), true);
      assert.equal(coerce(5.5, { radius: 1 }, 'anything'), 5.5);
    });
  });
});
