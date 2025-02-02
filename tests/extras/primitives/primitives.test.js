/* global AFRAME, assert, suite, test, THREE */
import * as helpers from '../../helpers.js';
import { registerPrimitive, primitives } from 'extras/primitives/primitives.js';

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
      setTimeout(function () {
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
        delete AFRAME.components.test;
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

  test('merges mixin for multi-prop component', function (done) {
    primitiveFactory({
      defaultComponents: {
        material: {color: 'blue'}
      }
    }, 'mixin="foo"', function postCreation (el) {
      assert.equal(el.getAttribute('material').color, 'blue');
      assert.equal(el.getAttribute('material').shader, 'flat');
      el.setAttribute('material', {side: 'double'});
      assert.equal(el.getAttribute('material').color, 'blue');
      assert.equal(el.getAttribute('material').shader, 'flat');
      assert.equal(el.getAttribute('material').side, 'double');
      done();
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('foo', {material: 'shader: flat'}, sceneEl);
    });
  });

  test('applies boolean mixin', function (done) {
    primitiveFactory({
      defaultComponents: {
        visible: {default: true}
      }
    }, 'mixin="foo"', function postCreation (el) {
      assert.equal(el.getAttribute('visible'), false);
      el.setAttribute('visible', true);
      assert.equal(el.getAttribute('visible'), true);
      done();
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('foo', {visible: false}, sceneEl);
    });
  });

  test('applies single-prop value mixin', function (done) {
    AFRAME.registerComponent('test', {
      schema: {default: 'foo'}
    });
    primitiveFactory({
      defaultComponents: {}
    }, 'mixin="foo"', function postCreation (el) {
      assert.equal(el.getAttribute('test'), 'bar');
      done();
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('foo', {test: 'bar'}, sceneEl);
    });
  });

  test('applies empty mixin', function (done) {
    AFRAME.registerComponent('test', {
      schema: {
        foo: {default: 'foo'},
        bar: {default: 'bar'}
      }
    });
    primitiveFactory({
      defaultComponents: {}
    }, 'mixin="foo"', function postCreation (el) {
      assert.equal(el.getAttribute('test').foo, 'foo');
      assert.equal(el.getAttribute('test').bar, 'bar');
      done();
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('foo', {test: ''}, sceneEl);
    });
  });

  test('prioritizes mapping over mixin', function (done) {
    primitiveFactory({
      defaultComponents: {
        material: {color: 'blue'}
      },
      mappings: {foo: 'material.color'}
    }, 'mixin="bar" foo="purple"', function postCreation (el) {
      assert.equal(el.getAttribute('material').color, 'purple');
      done();
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('bar', {material: 'color: orange'}, sceneEl);
    });
  });

  test('applies mappings to mixin attributes', function (done) {
    AFRAME.registerComponent('test', {
      schema: {default: 'foo'}
    });
    primitiveFactory({
      defaultComponents: {
        material: {color: 'blue'}
      },
      mappings: {foo: 'material.color'}
    }, 'mixin="bar"', function postCreation (el) {
      assert.equal(el.getAttribute('material').color, 'purple');
      done();
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('bar', {foo: 'purple'}, sceneEl);
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

  test('handles initializing with a defined multi-property component', function (done) {
    AFRAME.registerComponent('test', {
      schema: {
        foo: {type: 'string'},
        bar: {type: 'number'}
      }
    });
    primitiveFactory({}, 'test="foo: qux; bar: 10"', function postCreation (el) {
      assert.shallowDeepEqual(el.getAttribute('test'), {
        foo: 'qux',
        bar: 10
      });
      delete AFRAME.components.test;
      done();
    });
  });

  test('handles component with dependency', function (done) {
    AFRAME.registerComponent('testdep', {
      schema: {foo: {default: ''}},
      init: function () {
        this.el.setObject3D('test', new THREE.Object3D());
      }
    });

    AFRAME.registerComponent('test', {
      dependencies: ['testdep'],
      schema: {default: ''},
      init: function () {
        assert.ok(this.el.getObject3D('test'), 'testdep should have set this object3D.');
        delete AFRAME.components.test;
        delete AFRAME.components.testdep;
        done();
      }
    });

    primitiveFactory({
      defaultComponents: {
        testdep: {}
      }
    }, 'test=""');
  });

  test('initializes position, rotation, scale', function (done) {
    primitiveFactory({}, '', function (el) {
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 0, y: 0, z: 0});
      assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 0, y: 0, z: 0});
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 1, z: 1});
      done();
    });
  });

  test('with multiple primitives', function (done) {
    var count = 0;
    var el = helpers.entityFactory();
    var tagName = 'a-test-' + primitiveId++;
    registerPrimitive(tagName, {
      defaultComponents: {
        geometry: {primitive: 'plane'},
        material: {}
      },
      mappings: {color: 'material.color'}
    });
    el.addEventListener('child-attached', function (evt) {
      count++;
      if (count >= 2) {
        evt.detail.el.addEventListener('loaded', function () {
          setTimeout(function () {
            assert.equal(el.children[0].getAttribute('material').color, 'red');
            assert.equal(el.children[1].getAttribute('material').color, 'blue');
            done();
          });
        });
      }
    });
    el.innerHTML = `
      <${tagName} color="red"></${tagName}>
      <${tagName} color="blue"></${tagName}>
    `;
  });

  test('handles updated mixin', function (done) {
    primitiveFactory({
      defaultComponents: {
        material: {color: 'blue'}
      },
      mappings: {foo: 'material.color'}
    }, 'mixin="bar"', function postCreation (el) {
      assert.equal(el.getAttribute('material').color, 'orange');
      document.querySelector('[mixin="bar"]').setAttribute('material', 'color: black');
      setTimeout(function () {
        assert.equal(el.getAttribute('material').color, 'black');
        el.setAttribute('foo', 'purple');
        setTimeout(function () {
          assert.equal(el.getAttribute('material').color, 'purple');
          done();
        });
      });
    }, function preCreation (sceneEl) {
      helpers.mixinFactory('bar', {material: 'color: orange'}, sceneEl);
    });
  });

  test('resolves mapping collisions', function (done) {
    primitiveFactory({
      defaultComponents: {
        geometry: {primitive: 'box'},
        material: {},
        position: '1 2 3'
      },
      mappings: {visible: 'material.visible'}
    }, '', function (el) {
      assert.equal(el.mappings['material-visible'], 'material.visible');
      assert.notOk(el.mappings['visible']);
      done();
    });
  });

  test('handles mapping not in default components', function (done) {
    primitiveFactory({
      defaultComponents: {},
      mappings: {color: 'material.color'}
    }, '', function (el) {
      el.setAttribute('color', 'blue');
      setTimeout(() => {
        assert.equal(el.getAttribute('material').color, 'blue');
        done();
      });
    });
  });
});
