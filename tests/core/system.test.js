/* global AFRAME, assert, process, suite, test, setup */
var components = require('core/component').components;
var systems = require('core/system').systems;
var registerSystem = require('core/system').registerSystem;

var TestSystem = {
  init: function () {},
  update: function () {}
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

  suite('constructor', function () {
    test('sets reference to scene', function (done) {
      var sceneEl;
      AFRAME.registerSystem('test', {});
      sceneEl = document.createElement('a-scene');
      document.body.appendChild(sceneEl);
      setTimeout(() => {
        assert.equal(sceneEl.systems.test.el, sceneEl);
        assert.equal(sceneEl.systems.test.sceneEl, sceneEl);
        done();
      });
    });
  });

  suite('schema', function () {
    setup(function () {
      delete components.test;
      delete systems.test;
    });

    test('initializes data for single-prop schema', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      AFRAME.registerSystem('test', {
        schema: {default: ''}
      });
      TestSystem = systems.test;

      sceneEl.setAttribute('test', 'candy');
      system = new TestSystem(sceneEl);
      assert.equal(system.data, 'candy');
    });

    test('initializes data for multi-prop schema', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      AFRAME.registerSystem('test', {
        schema: {
          a: {type: 'number'},
          b: {type: 'string'}
        }
      });
      TestSystem = systems.test;

      sceneEl.setAttribute('test', 'a: 50; b: horses');
      system = new TestSystem(sceneEl);
      assert.equal(system.data.a, 50);
      assert.equal(system.data.b, 'horses');
    });

    test('uses default values', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      AFRAME.registerSystem('test', {
        schema: {
          a: {default: 50},
          b: {default: 'horses'}
        }
      });
      TestSystem = systems.test;

      system = new TestSystem(sceneEl);
      assert.equal(system.data.a, 50);
      assert.equal(system.data.b, 'horses');
    });

    test('can be empty', function () {
      var sceneEl = document.createElement('a-scene');
      var system;
      var TestSystem;

      AFRAME.registerSystem('test', {schema: {}});
      TestSystem = systems.test;

      system = new TestSystem(sceneEl);
      assert.notOk(system.data);
    });
  });

  test('can update system with setAttribute', function (done) {
    var sceneEl;
    var system;
    AFRAME.registerSystem('test', {
      schema: {
        foo: {type: 'string'},
        bar: {type: 'number'}
      }
    });
    sceneEl = document.createElement('a-scene');
    document.body.appendChild(sceneEl);

    setTimeout(() => {
      system = sceneEl.systems.test;

      sceneEl.setAttribute('test', {foo: 'foo', bar: 10});
      assert.equal(sceneEl.getAttribute('test').foo, 'foo');
      assert.equal(sceneEl.getAttribute('test').bar, 10);
      assert.equal(system.data.foo, 'foo');
      assert.equal(system.data.bar, 10);

      delete AFRAME.systems.test;
      done();
    });
  });

  test('calls update handler on init', function (done) {
    var sceneEl;
    AFRAME.registerSystem('test', {
      schema: {
        foo: {type: 'string', default: 'qaz'},
        bar: {type: 'number', default: 50}
      },

      update: function () {
        assert.equal(this.data.foo, 'qaz');
        assert.equal(this.data.bar, 50);
        delete AFRAME.systems.test;
        done();
      }
    });
    sceneEl = document.createElement('a-scene');
    document.body.appendChild(sceneEl);
  });

  test('calls update handler on update', function (done) {
    var sceneEl;
    AFRAME.registerSystem('test', {
      schema: {
        foo: {type: 'string', default: 'default'},
        bar: {type: 'number', default: 0}
      },

      update: function (oldData) {
        if (!Object.keys(oldData).length) { return; }
        assert.equal(oldData.foo, 'default');
        assert.equal(oldData.bar, 0);
        assert.equal(this.data.foo, 'foo');
        assert.equal(this.data.bar, 10);
        delete AFRAME.systems.test;
        done();
      }
    });
    sceneEl = document.createElement('a-scene');
    document.body.appendChild(sceneEl);
    setTimeout(() => {
      sceneEl.setAttribute('test', {foo: 'foo', bar: 10});
    });
  });
});
