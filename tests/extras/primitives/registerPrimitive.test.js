/* global assert, suite, test */
var helpers = require('../../helpers');
var registerPrimitive = require('extras/primitives/registerPrimitive');

var primitiveId = 0;

function primitiveFactory (def, cb) {
  var el;
  var entity = helpers.entityFactory();
  var tagName = 'a-test-' + primitiveId++;

  registerPrimitive(tagName, def);
  el = document.createElement(tagName);
  el.addEventListener('loaded', function () {
    cb(el, tagName);
  });
  entity.appendChild(el);
}

suite('registerPrimitive', function () {
  test('default attributes initialized', function (done) {
    primitiveFactory({
      defaultAttributes: {
        material: { color: 'tomato' },
        position: '1 2 3'
      }
    }, function (el) {
      assert.equal(el.getAttribute('material').color, 'tomato');
      assert.equal(el.getAttribute('position').x, 1);
      done();
    });
  });

  test('mapping proxy attributes to components', function (done) {
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
