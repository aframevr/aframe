/* global assert, suite, test */
var helpers = require('../../helpers');
var registerPrimitive = require('extras/primitives/registerPrimitive');

var primitiveId = 0;

function primitiveFactory (definition, cb) {
  var el;
  var entity = helpers.entityFactory();
  var tagName = 'a-test-' + primitiveId++;

  registerPrimitive(tagName, definition);
  el = document.createElement(tagName);
  el.addEventListener('loaded', function () {
    cb(el, tagName);
  });
  entity.appendChild(el);
}

suite('registerPrimitive', function () {
  test('initializes default attributes', function (done) {
    primitiveFactory({
      defaultComponents: {
        geometry: {primitive: 'box'},
        material: {},
        position: '1 2 3'
      }
    }, function (el) {
      assert.equal(el.getAttribute('geometry').primitive, 'box');
      assert.ok('material' in el.components);
      assert.equal(el.getAttribute('position').x, 1);
      done();
    });
  });

  test('merges defined components with default components', function (done) {
    primitiveFactory({
      defaultComponents: {
        material: {color: '#FFF', metalness: 0.63}
      }
    }, function (el) {
      el.setAttribute('material', 'color', 'tomato');
      var material = el.getAttribute('material');
      assert.equal(material.color, 'tomato');
      assert.equal(material.metalness, 0.63);
      done();
    });
  });

  test('does not destroy defined components when proxying attributes', function (done) {
    var entity = helpers.entityFactory();
    var tag = 'a-test-' + primitiveId++;
    registerPrimitive(tag, {
      defaultComponents: {
        material: {color: '#FFF'}
      },

      mappings: {
        color: 'material.color'
      }
    });
    // Use innerHTML to set everything at once.
    entity.innerHTML = '<' + tag + ' color="red" material="fog: false"></' + tag + '>';
    entity.children[0].addEventListener('loaded', function () {
      var material = entity.children[0].getAttribute('material');
      assert.equal(material.color, 'red');
      assert.equal(material.fog, 'false');
      done();
    });
  });

  test('maps attributes to components', function (done) {
    primitiveFactory({
      mappings: {
        color: 'material.color',
        'position-aliased': 'position'
      }
    }, function (el) {
      el.setAttribute('color', 'tomato');
      el.setAttribute('position-aliased', '1 2 3');
      process.nextTick(function () {
        assert.equal(el.getAttribute('material').color, 'tomato');
        assert.equal(el.getAttribute('position').x, 1);
        done();
      });
    });
  });

  test('can mix in common mesh properties', function (done) {
    primitiveFactory({
      includeMeshProperties: true,
      defaultComponents: {
        geometry: {primitive: 'box'}
      }
    }, function (el) {
      el.setAttribute('color', 'tomato');
      process.nextTick(function () {
        assert.equal(el.getAttribute('material').color, 'tomato');
        done();
      });
    });
  });

  test('transforms', function (done) {
    primitiveFactory({
      mappings: {
        opacity: 'material.opacity'
      },
      transforms: {
        opacity: function (value) {
          return value * 2;
        }
      }
    }, function (el) {
      el.setAttribute('opacity', '.25');
      process.nextTick(function () {
        assert.equal(el.getAttribute('material').opacity, 0.5);
        done();
      });
    });
  });
});
