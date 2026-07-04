/* global assert, suite, test */
import * as styleParser from 'utils/styleParser.js';

suite('utils.styleParser', function () {
  suite('parse', function () {
    test('parses style string', function () {
      var result = styleParser.parse('primitive: box; width: 5');
      assert.equal(result.primitive, 'box');
      assert.equal(result.width, '5');
    });

    test('does not split on semicolons within url()', function () {
      var result = styleParser.parse('src: url(data:image/png;base64,abc=); color: red');
      assert.equal(result.src, 'url(data:image/png;base64,abc=)');
      assert.equal(result.color, 'red');
    });

    test('does not split on semicolons within parentheses', function () {
      var result = styleParser.parse(
        'material: material(shader: flat; color: red); side: double');
      assert.equal(result.material, 'material(shader: flat; color: red)');
      assert.equal(result.side, 'double');
    });

    test('handles nested parentheses', function () {
      var result = styleParser.parse(
        'material: material(src: url(data:image/png;base64,a=); color: red); side: front');
      assert.equal(result.material, 'material(src: url(data:image/png;base64,a=); color: red)');
      assert.equal(result.side, 'front');
    });

    test('returns plain string unchanged', function () {
      assert.equal(styleParser.parse('red'), 'red');
    });

    test('is re-entrant when a property assignment triggers a nested parse', function () {
      // Simulates the component attrValueProxy: assigning a parsed value can
      // synchronously parse another style string (e.g., inline material(...)).
      var obj = {};
      var nested;
      Object.defineProperty(obj, 'material', {
        set: function (value) {
          nested = styleParser.parse('shader: flat; color: red');
          this.materialValue = value;
        },
        get: function () { return this.materialValue; }
      });

      var result = styleParser.parse(
        'material: material(shader: flat; color: red); side: double', obj);
      assert.equal(result.material, 'material(shader: flat; color: red)');
      assert.equal(result.side, 'double');
      assert.notOk('color' in result);
      assert.shallowDeepEqual(nested, {shader: 'flat', color: 'red'});
    });
  });

  suite('stringify', function () {
    test('stringifies object to style string', function () {
      assert.equal(styleParser.stringify({primitive: 'box', width: '5'}),
                   'primitive: box; width: 5');
    });
  });
});
