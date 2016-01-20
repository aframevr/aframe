/* global assert, process, suite, test */
'use strict';
var buildData = require('core/component').buildData;
var components = require('index').components;
var helpers = require('../helpers');
var registerComponent = require('index').registerComponent;
var processSchema = require('core/schema').process;

var CloneComponent = {
  init: function () {
    var object3D = this.el.object3D;
    var clone = object3D.clone();
    clone.uuid = 'Bubble Fett';
    object3D.add(clone);
  }
};
var entityFactory = helpers.entityFactory;

suite('Component', function () {
  suite('standard components', function () {
    test('are registered', function () {
      assert.ok('geometry' in components);
      assert.ok('material' in components);
      assert.ok('light' in components);
      assert.ok('position' in components);
      assert.ok('rotation' in components);
      assert.ok('scale' in components);
    });
  });

  suite('buildData', function () {
    test('uses default values', function () {
      var schema = processSchema({
        color: { default: 'blue' },
        size: { default: 5 }
      });
      var el = document.createElement('a-entity');
      var data = buildData(el, 'dummy', schema, {}, null);
      assert.equal(data.color, 'blue');
      assert.equal(data.size, 5);
    });

    test('uses default values for single-property schema', function () {
      var schema = processSchema({
        default: 'blue'
      });
      var el = document.createElement('a-entity');
      var data = buildData(el, 'dummy', schema, {}, null);
      assert.equal(data, 'blue');
    });

    test('uses mixin values', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {
          color: { default: 'red' },
          size: { default: 5 }
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');

      mixinEl.setAttribute('dummy', 'color: blue; size: 10');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, {}, null);
      assert.equal(data.color, 'blue');
      assert.equal(data.size, 10);
    });

    test('uses mixin values for single-property schema', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {
          default: 'red'
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('dummy', 'blue');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, {}, null);
      assert.equal(data, 'blue');
    });

    test('uses defined values', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {
          color: { default: 'red' },
          size: { default: 5 }
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');

      mixinEl.setAttribute('dummy', 'color: blue; size: 10');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, {
        color: 'green', size: 20
      }, 'color: green; size: 20');
      assert.equal(data.color, 'green');
      assert.equal(data.size, 20);
    });

    test('uses defined values for single-property schema', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: { default: 'red' }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('dummy', 'blue');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, 'green', 'green');
      assert.equal(data, 'green');
    });
  });

  suite('third-party components', function () {
    test('can be registered', function () {
      assert.notOk('clone' in components);
      registerComponent('clone', CloneComponent);
      assert.ok('clone' in components);
    });

    test('can change behavior of entity', function (done) {
      var el = entityFactory();
      registerComponent('clone', CloneComponent);

      el.addEventListener('loaded', function () {
        assert.notOk('clone' in el.components);
        assert.notOk(el.object3D.children.length);
        el.setAttribute('clone', '');
        assert.ok('clone' in el.components);
        assert.equal(el.object3D.children[0].uuid, 'Bubble Fett');
        done();
      });
    });
  });

  suite('schema', function () {
    test('can be accessed', function () {
      assert.ok(components.position.schema);
    });
  });
});
