/* global AFRAME, assert, process, suite, test, setup */
var components = require('core/component').components;
var systems = require('core/system').systems;
var registerSystem = require('core/system').registerSystem;

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
      registerSystem('test', {init: function () {}});
      assert.ok('test' in systems);
    });
  });

  suite('schema', function () {
    setup(function () {
      delete components.test;
      delete systems.test;
    });

    test.only('initializes data for single-prop schema', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      TestSystem = AFRAME.registerSystem('test', {
        schema: {default: ''}
      });

      sceneEl.setAttribute('test', 'candy');
      system = new TestSystem(sceneEl, 'candy', '');
      assert.equal(system.data, 'candy');
    });

    test('initializes data for multi-prop schema', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      TestSystem = AFRAME.registerSystem('test', {
        schema: {
          a: {type: 'number'},
          b: {type: 'string'}
        }
      });

      sceneEl.setAttribute('test', 'a: 50; b: horses');
      system = new TestSystem(sceneEl, 'test', '');
      assert.equal(system.data.a, 50);
      assert.equal(system.data.b, 'horses');
    });

    test('uses default values', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      TestSystem = AFRAME.registerSystem('test', {
        schema: {
          a: {default: 50},
          b: {default: 'horses'}
        }
      });

      system = new TestSystem(sceneEl, 'test', '');
      assert.equal(system.data.a, 50);
      assert.equal(system.data.b, 'horses');
    });

    test('can be empty', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      TestSystem = AFRAME.registerSystem('test', {schema: {}});

      system = new TestSystem(sceneEl, 'test', '');
      assert.notOk(system.data);
    });
  });
});
