/* global AFRAME, assert, suite, test */
var helpers = require('../../helpers');
var registerPrimitive = require('extras/primitives/primitives').registerPrimitive;
var primitives = require('extras/primitives/primitives').primitives;

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

suite('primitives', function () {
  test('are public', function () {
    assert.ok('a-box' in primitives);
    assert.ok('a-light' in primitives);
    assert.ok('a-sky' in primitives);
    assert.ok('a-sphere' in primitives);
    assert.ok('a-videosphere' in primitives);
  });
});

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
});

suite('registerPrimitive (using innerHTML)', function () {
  function primitiveFactory (definition, attributes, cb, preCb) {
    var el = helpers.entityFactory();
    var tagName = 'a-test-' + primitiveId++;
    registerPrimitive(tagName, definition);
    if (preCb) { preCb(el.sceneEl); }
    if (cb) {
      el.addEventListener('child-attached', function (evt) {
        evt.detail.el.addEventListener('loaded', function () {
          cb(el.children[0], tagName);
        });
      });
    }
    el.innerHTML = `<${tagName} ${attributes}></${tagName}>`;
  }

  test('prioritizes defined components over default components', function (done) {
    primitiveFactory({
      defaultComponents: {
        material: {color: '#FFF', metalness: 0.63}
      }
    }, 'material="color: tomato"', function (el) {
      var material = el.getAttribute('material');
      assert.equal(material.color, 'tomato');
      assert.equal(material.metalness, 0.63);
      done();
    });
  });

  test('batches default components and mappings for one `init` call', function (done) {
    AFRAME.registerComponent('test', {
      schema: {
        foo: {default: ''},
        qux: {default: ''},
        quux: {default: ''}
      },
      init: function () {
        // Set by default component.
        assert.equal(this.data.foo, 'bar');
        // Set by first mapping.
        assert.equal(this.data.qux, 'qaz');
        // Set by second mapping.
        assert.equal(this.data.quux, 'corge');
        done();
      }
    });
    primitiveFactory({
      defaultComponents: {
        test: {foo: 'bar'}
      },
      mappings: {
        qux: 'test.qux',
        quux: 'test.quux'
      }
    }, 'qux="qaz" quux="corge"');
  });

  test('prioritizes mixins over default components', function (done) {
    primitiveFactory({
      defaultComponents: {
        material: {color: 'blue'}
      }
    }, 'mixin="foo"', function postCreation (el) {
      assert.equal(el.getAttribute('material').color, 'red');
      done();
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('foo', {material: 'color: red'}, sceneEl);
    });
  });

  test('handles mapping to a single-property component', function (done) {
    primitiveFactory({
      mappings: {
        viz: 'visible'
      }
    }, 'viz="false"', function postCreation (el) {
      assert.equal(el.getAttribute('visible'), false);
      done();
    });
  });
});
