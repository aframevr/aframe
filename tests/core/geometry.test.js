/* global assert, process, suite, test, setup */
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
    setup(function () {
      delete geometries.test;
    });

    test('can register shaders', function () {
      registerGeometry('test', {});
      assert.ok('test' in geometries);
      assert.notEqual(geometryNames.indexOf('test'), -1);
    });
  });
});
