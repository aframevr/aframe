/* global assert, process, suite, test, teardown */
var registerGeometry = require('core/geometry').registerGeometry;
var geometries = require('core/geometry').geometries;
var geometryNames = require('core/geometry').geometryNames;

suite('core/geometry', function () {
  test('registers standard geometries', function () {
    assert.ok('box' in geometries);
    assert.ok('sphere' in geometries);
    assert.notEqual(geometryNames.indexOf('box'), -1);
    assert.notEqual(geometryNames.indexOf('sphere'), -1);
  });

  suite('registerGeometry', function () {
    teardown(function () {
      delete geometries.test;
      var i = geometryNames.indexOf('test');
      geometryNames.splice(i, 1);
    });

    test('can register geometries', function () {
      registerGeometry('test', {});
      assert.ok('test' in geometries);
      assert.notEqual(geometryNames.indexOf('test'), -1);
    });
  });
});
