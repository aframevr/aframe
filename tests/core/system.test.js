/* global assert, process, suite, test, setup */
'use strict';
var systems = require('core/system').systems;
var registerSystem = require('core/system').registerSystem;

var TestSystem = {
  init: function () {}
};

suite('System', function () {
  suite('standard systems', function () {
    test('are registered', function () {
      assert.ok('material' in systems);
    });
  });

  suite('system registration', function () {
    setup(function () {
      delete systems.test;
    });

    test('can be registered', function () {
      assert.notOk('TestSystem' in systems);
      registerSystem('test', TestSystem);
      assert.ok('test' in systems);
    });
  });
});
