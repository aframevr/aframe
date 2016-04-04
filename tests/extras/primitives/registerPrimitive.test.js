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
      defaultAttributes: {
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
    var entity = helpers.entityFactory();
    var tagName = 'a-test-' + primitiveId++;
    registerPrimitive(tagName, {
      defaultAttributes: {
        material: {color: '#FFF', metalness: 0.63}
      }
    });

    // Use innerHTML to set everything at once.
    entity.innerHTML = '<' + tagName + ' material="color: tomato"></' + tagName + '>';
    entity.addEventListener('loaded', function () {
      var material = entity.children[0].getAttribute('material');
      assert.equal(material.color, 'tomato');
      assert.equal(material.metalness, 0.63);
      done();
    });
  });

  test('does not destroy defined components when proxying attributes', function (done) {
    var entity = helpers.entityFactory();
    var tag = 'a-test-' + primitiveId++;
    registerPrimitive(tag, {
      defaultAttributes: {
        material: {color: '#FFF'}
      },

      mappings: {
        color: 'material.color'
      }
    });

    // Use innerHTML to set everything at once.
    entity.innerHTML = '<' + tag + ' color="red" material="fog: false"></' + tag + '>';
    entity.addEventListener('loaded', function () {
      var material = entity.children[0].getAttribute('material');
      assert.equal(material.color, 'red');
      assert.equal(material.fog, 'false');
      done();
    });
  });

  test('proxies attributes to components', function (done) {
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
