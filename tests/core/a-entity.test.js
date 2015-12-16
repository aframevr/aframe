/* global assert, process, sinon, setup, suite, test, HTMLElement */
var AEntity = require('core/a-entity');
var THREE = require('index').THREE;
var helpers = require('../helpers');

var entityFactory = helpers.entityFactory;
var mixinFactory = helpers.mixinFactory;

suite('a-entity', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('adds itself to parent when attached', function (done) {
    var el = document.createElement('a-entity');
    var parentEl = this.el;
    el.object3D = new THREE.Mesh();
    parentEl.appendChild(el);
    el.addEventListener('loaded', function () {
      assert.equal(parentEl.object3D.children[0].uuid, el.object3D.uuid);
      done();
    });
  });

  suite('attachedCallback', function () {
    test('initializes 3D object', function (done) {
      var el = entityFactory();
      el.addEventListener('loaded', function () {
        assert.isDefined(el.object3D);
        done();
      });
    });

    test('calls load method', function (done) {
      var el = entityFactory();
      this.sinon.spy(AEntity.prototype, 'load');
      el.addEventListener('loaded', function () {
        sinon.assert.called(AEntity.prototype.load);
        done();
      });
    });
  });

  /**
   * Tests full component set + get flow on one of the most basic components.
   */
  suite('attributeChangedCallback', function () {
    test('can remove component', function () {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box');
      assert.ok('geometry' in el.components);
      el.removeAttribute('geometry');
      assert.notOk('geometry' in el.components);
    });

    test('does not remove default component', function () {
      var el = this.el;
      assert.ok('position' in el.components);
      el.removeAttribute('position');
      assert.ok('position' in el.components);
    });

    test('does not remove mixed-in component', function () {
      var el = this.el;
      var mixinId = 'geometry';
      mixinFactory(mixinId, {geometry: 'primitive: box'});
      el.setAttribute('mixin', mixinId);
      el.setAttribute('geometry', 'primitive: sphere');
      assert.ok('geometry' in el.components);
      el.removeAttribute('geometry');
      // Geometry still exists since it is mixed in.
      assert.ok('geometry' in el.components);
    });

    test('can update component data', function () {
      var el = this.el;
      var position;

      el.setAttribute('position', '10 20 30');
      position = el.getAttribute('position');
      assert.deepEqual(position, {x: 10, y: 20, z: 30});

      el.setAttribute('position', {x: 30, y: 20, z: 10});
      position = el.getAttribute('position');
      assert.deepEqual(position, {x: 30, y: 20, z: 10});
    });
  });

  suite('detachedCallback', function () {
    test('removes itself from entity parent', function (done) {
      var parentEl = entityFactory();
      var el = document.createElement('a-entity');

      parentEl.appendChild(el);

      el.addEventListener('loaded', function () {
        parentEl.removeChild(el);
        process.nextTick(function () {
          assert.equal(parentEl.object3D.children.length, 0);
          done();
        });
      });
    });

    test('removes itself from scene parent', function (done) {
      var el = this.el;
      var parentEl = el.parentNode;
      parentEl.removeChild(el);
      process.nextTick(function () {
        assert.equal(parentEl.object3D.children.length, 0);
        done();
      });
    });
  });

  suite('getAttribute', function () {
    test('returns parsed component data', function () {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getAttribute('geometry');
      assert.equal(componentData.width, 5);
      assert.notOk('height' in componentData);
    });

    test('returns empty object if component is at defaults', function () {
      var el = this.el;
      el.setAttribute('material', '');
      assert.shallowDeepEqual(el.getAttribute('material'), {});
    });

    test('returns partial component data', function () {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getAttribute('geometry');
      assert.equal(componentData.width, 5);
      assert.notOk('height' in componentData);
    });

    test('falls back to HTML getAttribute if not a component', function () {
      var el = this.el;
      el.setAttribute('class', 'pied piper');
      assert.equal(el.getAttribute('class'), 'pied piper');
    });
  });

  suite('getComputedAttribute', function () {
    test('returns full component data', function () {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getComputedAttribute('geometry');
      assert.equal(componentData.primitive, 'box');
      assert.equal(componentData.width, 5);
      assert.ok('height' in componentData);
    });

    test('falls back to HTML getAttribute if not a component', function () {
      var el = this.el;
      el.setAttribute('class', 'pied piper');
      assert.equal(el.getComputedAttribute('class'), 'pied piper');
    });
  });

  suite('setAttribute', function () {
    test('can set a component with a string', function () {
      var el = this.el;
      var material;
      el.setAttribute('material', 'color: #F0F; metalness: 0.75');
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.metalness, 0.75);
    });

    test('can set a component with an object', function () {
      var el = this.el;
      var material;
      var value = { color: '#F0F', metalness: 0.75 };
      el.setAttribute('material', value);
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.metalness, 0.75);
    });

    test('can replace component attributes with an object', function () {
      var el = this.el;
      var material;
      var value = { color: '#000' };
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      el.setAttribute('material', value);
      material = el.getAttribute('material');
      assert.equal(material.color, '#000');
      assert.equal(material.roughness, undefined);
    });

    test('can set a single component via a single attribute', function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#F0F');
      assert.equal(el.getAttribute('material').color, '#F0F');
    });

    test('can update a single component attribute', function () {
      var el = this.el;
      var material;
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      assert.equal(el.getAttribute('material').roughness, 0.25);
      el.setAttribute('material', 'roughness', 0.75);
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.roughness, 0.75);
    });

    test('transforms object to string before setting on DOM', function () {
      var el = this.el;
      var positionObj = { x: 10, y: 20, z: 30 };
      el.setAttribute('position', positionObj);
      assert.ok(el.outerHTML.indexOf('position="10 20 30"') !== -1);
    });
  });

  suite('removeAttribute', function () {
    test('can remove a normal attribute', function () {
      var el = this.el;
      el.setAttribute('id', 'id-entity');
      assert.equal(el.getAttribute('id'), 'id-entity');
      el.removeAttribute('id');
      assert.notOk(el.getAttribute('id'));
    });

    test('can remove a component', function () {
      var el = this.el;
      el.setAttribute('material', 'color: #F0F');
      assert.ok(el.components.material);
      el.removeAttribute('material');
      assert.notOk(el.components.material);
    });

    test('can remove a component attribute', function () {
      var el = this.el;
      el.setAttribute('material', 'color: #F0F; transparent: true');
      assert.ok(el.getAttribute('material', 'transparent'));
      el.removeAttribute('material', 'transparent');
      assert.notOk(el.getAttribute('material', 'transparent'));
      assert.equal(el.getAttribute('material', 'color', '#F0F'));
    });
  });

  suite('initComponent', function () {
    test('initializes component', function () {
      var el = this.el;
      var nativeSetAttribute = HTMLElement.prototype.setAttribute;
      this.sinon.stub(el, 'setAttribute', nativeSetAttribute);
      el.setAttribute('material', 'color: #F0F; transparent: true');
      el.initComponent('material');
      assert.ok(el.components.material);
    });

    test('does not initialized non-registered component', function () {
      var el = this.el;
      var nativeSetAttribute = HTMLElement.prototype.setAttribute;
      this.sinon.stub(el, 'setAttribute', nativeSetAttribute);
      el.setAttribute('fake-component', 'color: #F0F;');
      el.initComponent('fake-component');
      assert.notOk(el.components.fakeComponent);
    });

    test('initializes dependency component and can set attribute', function () {
      var el = this.el;
      var nativeGetAttribute = HTMLElement.prototype.getAttribute;
      this.sinon.stub(el, 'getAttribute', nativeGetAttribute);
      el.initComponent('material', true);
      assert.equal(el.getAttribute('material'), '');
    });

    test('initializes dependency component and current attribute honored', function () {
      var el = this.el;
      var materialAttribute = 'color: #F0F; transparent: true';
      var nativeSetAttribute = HTMLElement.prototype.setAttribute;
      var nativeGetAttribute = HTMLElement.prototype.getAttribute;
      this.sinon.stub(el, 'setAttribute', nativeSetAttribute);
      this.sinon.stub(el, 'getAttribute', nativeGetAttribute);
      el.setAttribute('material', materialAttribute);
      el.initComponent('material', true);
      assert.equal(el.getAttribute('material'), materialAttribute);
    });
  });
});
