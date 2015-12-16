/* global assert, process, suite, test */
'use strict';
var components = require('index').components;
var helpers = require('../helpers');
var registerComponent = require('index').registerComponent;

var cloneComponent = {
  init: function () {
    var object3D = this.el.object3D;
    var clone = object3D.clone();
    clone.uuid = 'Bubble Fett';
    object3D.add(clone);
  }
};
var entityFactory = helpers.entityFactory;

suite('component', function () {
  suite('core components', function () {
    test('are registered', function () {
      assert.ok('geometry' in components);
      assert.ok('material' in components);
      assert.ok('light' in components);
      assert.ok('position' in components);
      assert.ok('rotation' in components);
      assert.ok('scale' in components);
    });
  });

  suite('third-party components', function () {
    test('can be registered', function () {
      assert.notOk('clone' in components);
      registerComponent('clone', cloneComponent);
      assert.ok('clone' in components);
    });

    test('can change behavior of entity', function (done) {
      var el = entityFactory();
      el.addEventListener('loaded', function () {
        assert.notOk('clone' in el.components);
        assert.notOk(el.object3D.children.length);
        el.setAttribute('clone', '');
        assert.ok('clone' in el.components);
        assert.ok(el.object3D.children[0].uuid, 'Bubble Fett');
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
