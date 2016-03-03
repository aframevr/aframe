/* global assert, process, sinon, setup, suite, test, HTMLElement */
'use strict';
var AEntity = require('core/a-entity');
var extend = require('utils').extend;
var registerComponent = require('core/component').registerComponent;
var components = require('core/component').components;
var THREE = require('index').THREE;
var helpers = require('../helpers');

var entityFactory = helpers.entityFactory;
var mixinFactory = helpers.mixinFactory;
var TestComponent = {
  schema: {
    a: { default: 0 },
    b: { default: 1 }
  },
  init: function () { },
  update: function () { },
  remove: function () { },
  play: function () { },
  pause: function () { }
};

suite('a-entity', function () {
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

  test('emits event when child attached', function (done) {
    var el = document.createElement('a-entity');
    var parentEl = this.el;
    el.object3D = new THREE.Mesh();
    parentEl.appendChild(el);
    parentEl.addEventListener('child-attached', function (event) {
      assert.equal(event.detail.el, el);
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

    test('waits for children to load', function (done) {
      var scene = document.createElement('a-scene');
      var entity = document.createElement('a-entity');
      var entityChild1 = document.createElement('a-entity');
      var entityChild2 = document.createElement('a-entity');
      entity.appendChild(entityChild1);
      entity.appendChild(entityChild2);
      scene.appendChild(entity);
      document.body.appendChild(scene);

      entity.addEventListener('loaded', function () {
        assert.ok(entityChild1.hasLoaded);
        assert.ok(entityChild2.hasLoaded);
        done();
      });
    });

    test('plays when entity is attached after scene load', function (done) {
      var el = document.createElement('a-entity');
      this.sinon.spy(AEntity.prototype, 'play');

      this.el.sceneEl.appendChild(el);
      el.addEventListener('loaded', function () {
        sinon.assert.called(AEntity.prototype.play);
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
      mixinFactory(mixinId, { geometry: 'primitive: box' });
      el.setAttribute('mixin', mixinId);
      el.setAttribute('geometry', 'primitive: sphere');
      assert.ok('geometry' in el.components);
      el.removeAttribute('geometry');
      // Geometry still exists since it is mixed in.
      assert.ok('geometry' in el.components);
    });

    test('applies default vec3 component from mixin', function () {
      var el = this.el;
      var mixinId = 'position';
      mixinFactory(mixinId, { position: '1 2 3' });
      el.setAttribute('mixin', mixinId);
      assert.shallowDeepEqual(el.getComputedAttribute('position'), { x: 1, y: 2, z: 3 });
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
        assert.equal(parentEl.object3D.children.length, 3);
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

  suite('getChildEntities', function () {
    test('returns child entities', function (done) {
      var entity = document.createElement('a-entity');
      var animationChild = document.createElement('a-animation');
      var entityChild1 = document.createElement('a-entity');
      var entityChild2 = document.createElement('a-entity');
      entity.appendChild(animationChild);
      entity.appendChild(entityChild1);
      entity.appendChild(entityChild2);
      document.body.appendChild(entity);

      entity.addEventListener('loaded', function () {
        var childEntities = entity.getChildEntities();
        assert.equal(childEntities.length, 2);
        assert.equal(childEntities.indexOf(animationChild), -1);
        done();
      });
    });
  });

  suite('getObject3D', function () {
    test('returns requested object3D', function () {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      assert.ok(el.getObject3D('mesh'));
    });

    test('it returns undefined for a non existing object3D', function () {
      assert.notOk(this.el.getObject3D('dummy'));
    });
  });

  suite('setObject3D', function () {
    test('sets the object3D for the given type', function () {
      var el = this.el;
      var object3D = new THREE.Group();
      el.setObject3D('mesh', object3D);
      assert.equal(el.getObject3D('mesh'), object3D);
      assert.equal(object3D.el, el);
    });

    test('resets the object3D for a given type', function () {
      var el = this.el;
      var nullObj = null;
      el.setObject3D('mesh', nullObj);
      assert.equal(el.getObject3D('mesh'), nullObj);
    });
  });

  suite('getOrCreateObject3D', function () {
    test('creates an object3D if the type does not exist', function () {
      var el = this.el;
      var Constructor = function () {};
      el.getOrCreateObject3D('mesh', Constructor);
      assert.ok(el.getObject3D('mesh'));
      assert.equal(el.getObject3D('mesh').constructor, Constructor);
    });

    test('returns existing object3D if it exists', function () {
      var el = this.el;
      var Constructor = function () {};
      var dummy = {};
      el.object3DMap['dummy'] = dummy;
      el.getOrCreateObject3D('dummy', Constructor);
      assert.ok(el.getObject3D('dummy'));
      assert.equal(el.getObject3D('dummy'), dummy);
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

  suite('removeComponent', function () {
    test('removes a behavior', function () {
      var el = this.el;
      var sceneEl = el.sceneEl;
      var component;
      el.setAttribute('look-controls', '');
      component = el.components['look-controls'];
      assert.ok(el.getAttribute('look-controls'));
      assert.notEqual(sceneEl.behaviors.indexOf(component), -1);
      el.removeAttribute('look-controls');
      assert.equal(sceneEl.behaviors.indexOf(component), -1);
    });
  });
});

suite('a-entity component lifecycle management', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    components.test = undefined;
    this.TestComponent = registerComponent('test', TestComponent);
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('calls init on component attach', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'init');
    sinon.assert.notCalled(TestComponent.init);
    this.el.setAttribute('test', '');
    sinon.assert.called(TestComponent.init);
  });

  test('calls init only once', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'init');
    this.el.setAttribute('test', '');
    sinon.assert.calledOnce(TestComponent.init);
    this.el.setAttribute('test', 'a: 5');
    sinon.assert.calledOnce(TestComponent.init);
  });

  test('calls update on component attach', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'update');
    sinon.assert.notCalled(TestComponent.update);
    this.el.setAttribute('test', '');
    sinon.assert.called(TestComponent.update);
  });

  test('calls update on setAttribute', function () {
    var el = this.el;
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'update');
    el.setAttribute('test', '');
    sinon.assert.calledOnce(TestComponent.update);
    el.setAttribute('test', 'a: 5');
    sinon.assert.calledTwice(TestComponent.update);
  });

  test('does not call update on setAttribute if no change', function () {
    var el = this.el;
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'update');
    el.setAttribute('test', 'a: 3');
    sinon.assert.calledOnce(TestComponent.update);
    el.setAttribute('test', 'a: 3');
    sinon.assert.calledOnce(TestComponent.update);
  });

  test('calls remove on removeAttribute', function () {
    var el = this.el;
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'remove');
    el.setAttribute('test', '');
    sinon.assert.notCalled(TestComponent.remove);
    el.removeAttribute('test');
    sinon.assert.called(TestComponent.remove);
  });

  test('calls remove on removeComponents', function () {
    var el = this.el;
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'remove');
    el.setAttribute('test', '');
    sinon.assert.notCalled(TestComponent.remove);
    el.removeComponents();
    sinon.assert.called(TestComponent.remove);
  });

  test('calls pause on entity pause', function () {
    var el = this.el;
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'pause');
    el.setAttribute('test', '');
    el.play();
    sinon.assert.notCalled(TestComponent.pause);
    el.pause();
    sinon.assert.called(TestComponent.pause);
  });

  test('calls play on entity play', function () {
    var el = this.el;
    var TestComponent = this.TestComponent.prototype;
    this.el.pause();

    this.sinon.spy(TestComponent, 'play');
    el.setAttribute('test', '');
    sinon.assert.notCalled(TestComponent.play);
    el.play();
    sinon.assert.called(TestComponent.play);
  });
});

suite('a-entity component dependency management', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    var componentNames = ['codependency', 'dependency', 'nested-dependency', 'test'];
    componentNames.forEach(function clearComponent (componentName) {
      components[componentName] = undefined;
    });

    this.TestComponent = registerComponent('test', extend({}, TestComponent, {
      dependencies: ['dependency', 'codependency']
    }));
    this.DependencyComponent = registerComponent('dependency', extend({}, TestComponent, {
      dependencies: ['nested-dependency']
    }));
    this.CoDependencyComponent = registerComponent('codependency', extend({}, TestComponent, {
      dependencies: []
    }));
    this.NestedDependencyComponent = registerComponent('nested-dependency', TestComponent);
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('initializes dependency components', function () {
    var el = this.el;
    el.setAttribute('test', '');
    assert.ok('dependency' in el.components);
    assert.ok('codependency' in el.components);
    assert.ok('nested-dependency' in el.components);
  });

  test('only initializes each component once', function () {
    var spy = this.sinon.spy(this.DependencyComponent.prototype, 'init');
    this.el.setAttribute('test', '');
    assert.equal(spy.callCount, 1);
  });
});
