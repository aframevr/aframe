/* global assert, suite, test */
var matrices = require('index').utils.matrices;

suite('utils.matrices', function () {
  suite('isMatrix3', function () {
    test('verifies valid matrix3', function () {
      assert.ok(matrices.isMatrix3('0 1 2 3.4 4 5 -6 7 -8.1'));
    });

    test('rejects invalid matrix3', function () {
      assert.ok(!matrices.isMatrix3('0 1 2 3.4 4 5 -6 7'));
    });
  });

  suite('parseMatrix3', function () {
    test('parses string', function () {
      assert.shallowDeepEqual(
        matrices.parseMatrix3('0 1 2 3 4 5 6 7 8'),
        [0, 3, 6, 1, 4, 7, 2, 5, 8]);
    });

    test('applies defaults to the missing values', function () {
      var defaultMatrix = [0, -1, 2, 3, 4.1, 5, 6, 7, -8.3];
      assert.deepEqual(
        matrices.parseMatrix3('10', defaultMatrix),
        [10, 3, 6, -1, 4.1, 7, 2, 5, -8.3]);
    });

    test('parses null', function () {
      assert.equal(matrices.parseMatrix3(null), undefined);
    });

    test('parses object with strings', function () {
      assert.shallowDeepEqual(
        matrices.parseMatrix3(
          ['0', '1', '2', '-31', '40.2', '5', '6', '7', '8']),
        [0, -31, 6, 1, 40.2, 7, 2, 5, 8]);
    });
  });

  suite('parseMatrix4', function () {
    test('parses string', function () {
      assert.shallowDeepEqual(
        matrices.parseMatrix4(
          '0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15'),
        [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]);
    });

    test('applies defaults to the missing values', function () {
      var defaultMatrix =
            [0, 1, 2, -3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13.1, 14, 15];
      assert.deepEqual(
        matrices.parseMatrix4('100', defaultMatrix),
        [100, 4, 8, 12, 1, 5, 9, 13.1, 2, 6, 10, 14, -3, 7, 11, 15]);
    });

    test('parses null', function () {
      assert.equal(matrices.parseMatrix4(null), undefined);
    });

    test('parses object with strings', function () {
      assert.shallowDeepEqual(
        matrices.parseMatrix4(
          ['0', '1', '2', '-31', '4', '5', '60', '7',
            '8', '9', '10', '11', '12', '13', '14', '15']),
        [0, 4, 8, 12, 1, 5, 9, 13, 2, 60, 10, 14, -31, 7, 11, 15]);
    });
  });

  suite('stringify', function () {
    test('stringifies a mat3', function () {
      assert.equal(
        matrices.stringify(
          [0, 3, 6, 1, 4, 7, 2, 5, 8]),
        '0 1 2 3 4 5 6 7 8');
    });

    test('stringifies a mat4', function () {
      assert.equal(
        matrices.stringify(
          [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15]),
        '0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15');
    });

    test('returns already-stringified string', function () {
      assert.equal(
        matrices.stringify('0 1 2 -3 4 5 -6 7 8'),
        '0 1 2 -3 4 5 -6 7 8');
    });
  });
});
