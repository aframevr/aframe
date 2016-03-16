/* global assert, process, suite, test, setup */
'use strict';
var registerShader = require('core/shader').registerShader;
var shaders = require('core/shader').shaders;
var shaderNames = require('core/shader').shaderNames;

suite('Shader', function () {
  test('standard shaders registered', function () {
    assert.ok('flat' in shaders);
    assert.ok('standard' in shaders);
    assert.notEqual(shaderNames.indexOf('flat'), -1);
    assert.notEqual(shaderNames.indexOf('standard'), -1);
  });

  suite('registerShader', function () {
    setup(function () {
      delete shaders.test;
    });

    test('can register shaders', function () {
      registerShader('test', {});
      assert.ok('test' in shaders);
      assert.notEqual(shaderNames.indexOf('test'), -1);
    });
  });
});
