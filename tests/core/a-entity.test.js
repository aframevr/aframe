/* global AFRAME, assert, process, sinon, setup, suite, teardown, test, HTMLElement */
var AEntity = require('core/a-entity').AEntity;
var ANode = require('core/a-node').ANode;
var extend = require('utils').extend;
var registerComponent = require('core/component').registerComponent;
var components = require('core/component').components;
var THREE = require('index').THREE;
var helpers = require('../helpers');

var elFactory = helpers.elFactory;
var mixinFactory = helpers.mixinFactory;
var TestComponent = {
  schema: {
    a: {default: 0},
    b: {default: 1}
  },
  init: function () { },
  update: function () { },
  remove: function () { },
  play: function () { },
  pause: function () { },
  tick: function () { },
  tock: function () { }
};

suite('a-entity', function () {
  var el;

  setup(function (done) {
    elFactory().then(_el => {
      el = _el;
      done();
    });
  });

  teardown(function () {
    components.test = undefined;
  });

  test('createdCallback', function () {
    assert.ok(el.isNode);
    assert.ok(el.isEntity);
  });

  test('adds itself to parent when attached', function (done) {
    const parentEl = el;
    const el2 = document.createElement('a-entity');
    el2.object3D = new THREE.Mesh();
    parentEl.appendChild(el2);
    el2.addEventListener('loaded', function () {
      assert.equal(parentEl.object3D.children[0].uuid, el2.object3D.uuid);
      assert.ok(el2.parentEl);
      assert.ok(el2.parentNode);
      done();
    });
  });

  test('emits event when child attached', function (done) {
    const parentEl = el;
    const el2 = document.createElement('a-entity');
    el2.object3D = new THREE.Mesh();
    parentEl.addEventListener('child-attached', function (event) {
      assert.equal(event.detail.el, el2);
      done();
    });
    parentEl.appendChild(el2);
  });

  test('emits `componentremoved` event when element itself has been removed', function (done) {
    el.setAttribute('geometry', 'primitive:plane');
    el.addEventListener('componentremoved', function onComponentRemoved (event) {
      assert.equal(event.detail.name, 'geometry');
      el.removeEventListener('componentremoved', onComponentRemoved);
      done();
    });
    el.removeAttribute('geometry');
  });

  test('can be detached and re-attached safely', function (done) {
    const parentEl = el;
    const el2 = document.createElement('a-entity');
    el2.object3D = new THREE.Mesh();
    el2.setAttribute('geometry', 'primitive:plane');
    el2.addEventListener('loaded', afterFirstAttachment);
    parentEl.appendChild(el2);

    function afterFirstAttachment () {
      el2.removeEventListener('loaded', afterFirstAttachment);

      assert.equal(parentEl.object3D.children[0].uuid, el2.object3D.uuid);
      assert.ok(el2.parentEl);
      assert.ok(el2.parentNode);
      assert.ok(el2.components.geometry);
      assert.isTrue(el2.hasLoaded);

      parentEl.removeChild(el2);
      setTimeout(afterDetachment);
    }

    function afterDetachment () {
      assert.equal(parentEl.object3D.children.length, 0);
      assert.notOk(el2.parentEl);
      assert.notOk(el2.parentNode);
      assert.ok(el2.components.geometry);
      assert.isFalse(el2.hasLoaded);

      el2.addEventListener('loaded', afterSecondAttachment);
      parentEl.appendChild(el2);
    }

    function afterSecondAttachment () {
      el2.removeEventListener('loaded', afterSecondAttachment);

      assert.equal(parentEl.object3D.children[0].uuid, el2.object3D.uuid);
      assert.ok(el2.parentEl);
      assert.ok(el2.parentNode);
      assert.ok(el2.components.geometry);
      assert.isTrue(el2.hasLoaded);

      done();
    }
  });

  test('entity has not loaded until all components have loaded', function (done) {
    const parentEl = el;
    const el2 = document.createElement('a-entity');
    registerComponent('test', {
      schema: {array: {type: 'array'}},
      init: function () {
        assert.notOk(this.el.hasLoaded);
        this.el.addEventListener('loaded', function () {
          assert.ok(el2.components.geometry);
          assert.ok(el2.components.material);
          assert.ok(el2.components.test);
          done();
        });
      }
    });
    el2.setAttribute('geometry', 'primitive:plane');
    el2.setAttribute('test', '');
    el2.setAttribute('material', 'color:blue');
    parentEl.appendChild(el2);
  });

  suite('attachedCallback', function () {
    test('initializes 3D object', function (done) {
      elFactory().then(el => {
        assert.isDefined(el.object3D);
        done();
      });
    });

    test('calls load method', function (done) {
      this.sinon.spy(AEntity.prototype, 'load');
      elFactory().then(el => {
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
        document.body.removeChild(scene);
        done();
      });
    });

    test('is playing when loaded', function (done) {
      const el2 = document.createElement('a-entity');
      el2.addEventListener('loaded', function () {
        assert.ok(el2.isPlaying);
        done();
      });
      el.sceneEl.appendChild(el2);
    });

    test('plays when entity is attached after scene load', function (done) {
      const el2 = document.createElement('a-entity');
      this.sinon.spy(AEntity.prototype, 'play');

      el2.addEventListener('play', function () {
        assert.ok(!el2.hasLoaded && el2.sceneEl);
        sinon.assert.called(AEntity.prototype.play);
        done();
      });
      el.sceneEl.appendChild(el2);
    });

    test('waits for <a-assets>', function (done) {
      var assetsEl;
      var el;
      var sceneEl;

      // Create DOM.
      sceneEl = document.createElement('a-scene');
      assetsEl = document.createElement('a-assets');
      assetsEl.setAttribute('timeout', 20);
      el = document.createElement('a-entity');

      el.addEventListener('loaded', function () {
        assert.ok(assetsEl.hasLoaded);
        assert.ok(el.hasLoaded);
        document.body.removeChild(sceneEl);
        done();
      });

      assetsEl.addEventListener('loaded', function () {
        assert.ok(assetsEl.hasLoaded);
        assert.notOk(el.hasLoaded);
      });

      sceneEl.appendChild(assetsEl);
      sceneEl.appendChild(el);
      document.body.appendChild(sceneEl);
    });
  });

  suite('addState', function () {
    test('adds state', function () {
      el.states = [];
      el.addState('happy');
      assert.ok(el.states[0] === 'happy');
    });

    test('it does not add an existing state', function () {
      el.states = ['happy'];
      el.addState('happy');
      assert.ok(el.states.length === 1);
    });
  });

  suite('removeState', function () {
    test('removes existing state', function () {
      el.states = ['happy'];
      el.removeState('happy');
      assert.ok(el.states.length === 0);
    });

    test('removes non existing state', function () {
      el.states = ['happy'];
      el.removeState('sad');
      assert.ok(el.states.length === 1);
    });

    test('removes existing state among multiple states', function () {
      el.states = ['happy', 'excited'];
      el.removeState('excited');
      assert.equal(el.states.length, 1);
      assert.ok(el.states[0] === 'happy');
    });
  });

  suite('is', function () {
    test('returns true if entity is in the given state', function () {
      el.states = ['happy'];
      el.is('happy');
      assert.ok(el.is('happy'));
    });

    test('returns false if entity is not in the given state', function () {
      el.states = ['happy'];
      el.is('happy');
      assert.ok(el.is('happy'));
    });
  });

  suite('setAttribute', function () {
    test('can set a component with a string', function () {
      var material;
      el.setAttribute('material', 'color: #F0F; metalness: 0.75');
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.metalness, 0.75);
    });

    test('can set a component with an object', function () {
      var material;
      var value = {color: '#F0F', metalness: 0.75};
      el.setAttribute('material', value);
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.metalness, 0.75);
    });

    test('can clobber component attributes with an object and flag', function () {
      var material;
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      el.setAttribute('material', {color: '#000'}, true);
      material = el.getAttribute('material');
      assert.equal(material.color, '#000');
      assert.equal(material.roughness, 0.5);
      assert.equal(el.getDOMAttribute('material').roughness, undefined);
    });

    test('can set a single component via a single attribute', function () {
      el.setAttribute('material', 'color', '#F0F');
      assert.equal(el.getAttribute('material').color, '#F0F');
    });

    test('can update a single component attribute', function () {
      var material;
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      assert.equal(el.getAttribute('material').roughness, 0.25);
      el.setAttribute('material', 'roughness', 0.75);
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.roughness, 0.75);
    });

    test('can update a single component attribute with a string', function () {
      var material;
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      assert.equal(el.getAttribute('material').roughness, 0.25);
      el.setAttribute('material', 'roughness: 0.75');
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.roughness, 0.75);
    });

    test('can clobber component attributes with a string and flag', function () {
      var material;
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      el.setAttribute('material', 'color: #000', true);
      material = el.getAttribute('material');
      assert.equal(material.color, '#000');
      assert.equal(material.roughness, 0.5);
      assert.equal(el.getDOMAttribute('material').roughness, undefined);
    });

    test('transforms object to string before setting on DOM', function () {
      var positionObj = {x: 10, y: 20, z: 30};
      el.setAttribute('position', positionObj);
      assert.ok(el.outerHTML.indexOf('position=""') !== -1);
    });

    test('can update component data', function () {
      el.setAttribute('position', '10 20 30');
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 10, y: 20, z: 30});

      el.setAttribute('position', {x: 30, y: 20, z: 10});
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 30, y: 20, z: 10});
    });

    test('can partially update multiple properties of a component', function () {
      var geometry;
      el.setAttribute('geometry', {primitive: 'box'});
      el.setAttribute('geometry', {depth: 2.5});
      el.setAttribute('geometry', {height: 1.5, width: 3});
      geometry = el.getAttribute('geometry');
      assert.equal(geometry.primitive, 'box');
      assert.equal(geometry.depth, 2.5);
      assert.equal(geometry.height, 1.5);
      assert.equal(geometry.width, 3);
    });

    test('partial updates of array properties assign by reference', function () {
      // Arrays are assigned by reference and mutable.
      var sourceArray = [1, 2, 3];
      registerComponent('test', {
        schema: {array: {type: 'array'}}
      });
      el.setAttribute('test', {array: sourceArray});
      assert.strictEqual(el.getAttribute('test').array, sourceArray);
    });

    test('partial updates of array-type properties do trigger update', function () {
      // Updates to array do not trigger update handler.
      var updateSpy;
      registerComponent('test', {
        schema: {array: {type: 'array'}},
        update: function () { /* no-op */ }
      });
      el.setAttribute('test', {array: [1, 2, 3]});
      updateSpy = this.sinon.spy(el.components.test, 'update');
      el.setAttribute('test', {array: [4, 5, 6]});
      assert.ok(updateSpy.called);
    });

    test('can partially update vec3', function () {
      el.setAttribute('position', {y: 20});
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 0, y: 20, z: 0});
    });

    test('can update component property with asymmetrical property type', function () {
      registerComponent('test', {
        schema: {
          asym: {
            default: 1,
            parse: function (value) {
              // When setAttribute re-gathers the component data, it should not double-parse.
              if (value === 2) { throw new Error('This should be 1'); }
              return value + 1;
            }
          },
          other: {
            default: 5
          }
        }
      });
      el.setAttribute('test', 'asym', 1);
      el.setAttribute('test', 'other', 2);
    });

    test('only stores modified properties in attribute cache', function () {
      el.setAttribute('geometry', {primitive: 'box'});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'box'});
      el.setAttribute('geometry', {primitive: 'sphere', radius: 10});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'sphere', radius: 10});
    });

    test('only caches modified properties when changing schema only', function () {
      el.setAttribute('geometry', {primitive: 'box'});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'box'});
      el.setAttribute('geometry', {primitive: 'sphere', radius: 10});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'sphere', radius: 10});

      const geometry = el.getAttribute('geometry');
      assert.equal(geometry.primitive, 'sphere');
      assert.equal(geometry.radius, 10);
      assert.notOk(geometry.depth);
      assert.notOk(geometry.height);
      assert.notOk(geometry.width);
    });

    test('parses individual properties when passing object', function (done) {
      AFRAME.registerComponent('foo', {
        schema: {
          bar: {type: 'asset'},
          baz: {type: 'asset'}
        },

        init: function () {
          assert.equal(this.data.bar, 'test.png');
          assert.equal(this.data.baz, 'test.jpg');
          delete AFRAME.components.foo;
          done();
        }
      });
      el.setAttribute('foo', {
        bar: 'url(test.png)',
        baz: 'url(test.jpg)'
      });
    });

    test('merges updates with previous data', function (done) {
      el.addEventListener('child-attached', evt => {
        el = evt.detail.el;
        el.addEventListener('loaded', evt => {
          var geometry;
          var setObj;

          assert.shallowDeepEqual(el.components.geometry.attrValue,
                                  {primitive: 'box', width: 5});

          // First setAttribute.
          setObj = {depth: 10, height: 20};
          el.setAttribute('geometry', setObj);
          geometry = el.getAttribute('geometry');
          assert.equal(geometry.depth, 10);
          assert.equal(geometry.height, 20);
          assert.equal(geometry.width, 5, 'First setAttribute');

          // Second setAttribute.
          el.setAttribute('geometry', {depth: 20, height: 10});
          geometry = el.getAttribute('geometry');
          assert.shallowDeepEqual(el.components.geometry.attrValue, {
            depth: 20,
            height: 10,
            primitive: 'box',
            width: 5
          }, 'Second attrValue');
          assert.equal(geometry.width, 5, 'Second setAttribute');
          done();
        });
      });

      // Initial data.
      el.innerHTML = '<a-entity geometry="primitive: box; width: 5">';
    });
  });

  suite('flushToDOM', function () {
    test('updates DOM attributes', function () {
      var material;
      var materialStr = 'color: #F0F; metalness: 0.75';
      el.setAttribute('material', materialStr);
      material = HTMLElement.prototype.getAttribute.call(el, 'material');
      assert.equal(material, '');
      el.flushToDOM();
      material = HTMLElement.prototype.getAttribute.call(el, 'material');
      assert.equal(material, materialStr);
    });

    test('updates DOM attributes of a multiple component', function () {
      var soundAttrValue;
      var soundStr = 'src: url(mysoundfile.mp3); autoplay: true';
      el.setAttribute('sound__1', {'src': 'url(mysoundfile.mp3)', autoplay: true});
      soundAttrValue = HTMLElement.prototype.getAttribute.call(el, 'sound__1');
      assert.equal(soundAttrValue, '');
      el.flushToDOM();
      soundAttrValue = HTMLElement.prototype.getAttribute.call(el, 'sound__1');
      assert.equal(soundAttrValue, soundStr);
    });

    test('updates DOM attributes recursively', function (done) {
      var childEl = document.createElement('a-entity');
      var childMaterialStr = 'color:pink';
      var materialAttr;
      var materialStr = 'color: #F0F; metalness: 0.75';
      childEl.addEventListener('loaded', function () {
        materialAttr = HTMLElement.prototype.getAttribute.call(el, 'material');
        assert.equal(materialAttr, null);
        materialAttr = HTMLElement.prototype.getAttribute.call(childEl, 'material');
        assert.equal(materialAttr, null);
        el.setAttribute('material', materialStr);
        childEl.setAttribute('material', childMaterialStr);
        el.flushToDOM(true);
        materialAttr = HTMLElement.prototype.getAttribute.call(el, 'material');
        assert.equal(materialAttr, 'color: #F0F; metalness: 0.75');
        materialAttr = HTMLElement.prototype.getAttribute.call(childEl, 'material');
        assert.equal(childMaterialStr, 'color:pink');
        done();
      });
      el.appendChild(childEl);
    });
  });

  suite('detachedCallback', function () {
    test('removes itself from entity parent', function (done) {
      elFactory().then(parentEl => {
        const el = document.createElement('a-entity');
        parentEl.appendChild(el);
        parentEl.removeChild(el);
        setTimeout(function () {
          assert.equal(parentEl.object3D.children.length, 0);
          assert.notOk(el.parentEl);
          assert.notOk(el.parentNode);
          done();
        });
      });
    });

    test('removes itself from scene parent', function (done) {
      const sceneEl = el.parentNode;
      assert.notEqual(sceneEl.object3D.children.indexOf(el.object3D), -1);
      sceneEl.removeChild(el);
      setTimeout(function () {
        assert.equal(sceneEl.object3D.children.indexOf(el.object3D), -1);
        done();
      });
    });

    test('properly detaches components', function (done) {
      var parentEl = el.parentNode;
      components.test = undefined;
      registerComponent('test', TestComponent);
      el.setAttribute('test', '');
      assert.notEqual(el.sceneEl.behaviors.tick.indexOf(el.components.test), -1);
      assert.notEqual(el.sceneEl.behaviors.tock.indexOf(el.components.test), -1);
      parentEl.removeChild(el);
      process.nextTick(function () {
        assert.ok('test' in el.components);
        assert.equal(el.sceneEl.behaviors.tick.indexOf(el.components.test), -1);
        assert.equal(el.sceneEl.behaviors.tock.indexOf(el.components.test), -1);
        done();
      });
    });

    test('handles detaching with with uninitialized components', function () {
      var box = document.createElement('a-entity');
      box.setAttribute('geometry', {primitive: 'box'});
      el.sceneEl.appendChild(box);
      el.sceneEl.removeChild(box);
      // Just check it doesn't error.
    });
  });

  suite('load', function () {
    test('does not try to load if not attached', function () {
      var el = document.createElement('a-entity');
      var nodeLoadSpy = this.sinon.spy(ANode.prototype, 'load');
      el.load();
      assert.notOk(nodeLoadSpy.called);
    });

    test('does not try to initialize during load callback if not attached', function (done) {
      const el = document.createElement('a-entity');
      const childEl = document.createElement('a-entity');

      el.setAttribute('id', 'parent');
      childEl.setAttribute('id', 'child');
      el.parentEl = true;
      el.appendChild(childEl);
      el.load();
      el.parentEl = null;
      childEl.emit('loaded');

      let nodeLoadSpy = this.sinon.spy(AEntity.prototype, 'updateComponents');
      setTimeout(function () {
        assert.notOk(nodeLoadSpy.called);
        done();
      });
    });

    test('wait for all the children nodes that are not yet nodes to load', function (done) {
      var a = document.createElement('a-entity');
      var b = document.createElement('a-entity');
      var aLoaded = false;
      var bLoaded = false;
      el.appendChild(a);
      el.appendChild(b);
      process.nextTick(function () {
        a.isNode = false;
        a.hasLoaded = false;
        b.isNode = false;
        b.hasLoaded = false;
        el.hasLoaded = false;
        el.addEventListener('loaded', function () {
          assert.ok(el.hasLoaded);
          assert.ok(aLoaded);
          assert.ok(bLoaded);
          done();
        });
        a.addEventListener('loaded', function () { aLoaded = true; });
        b.addEventListener('loaded', function () { bLoaded = true; });
        el.load();
        assert.notOk(el.hasLoaded);
        a.load();
        b.load();
      });
    });

    test('wait for all the children primitives that are not yet nodes to load', function (done) {
      var a = document.createElement('a-sphere');
      var b = document.createElement('a-box');
      var aLoaded = false;
      var bLoaded = false;
      el.appendChild(a);
      el.appendChild(b);
      process.nextTick(function () {
        a.isNode = false;
        a.hasLoaded = false;
        b.isNode = false;
        b.hasLoaded = false;
        el.hasLoaded = false;
        el.addEventListener('loaded', function () {
          assert.ok(el.hasLoaded);
          assert.ok(aLoaded);
          assert.ok(bLoaded);
          done();
        });
        a.addEventListener('loaded', function () { aLoaded = true; });
        b.addEventListener('loaded', function () { bLoaded = true; });
        el.load();
        assert.notOk(el.hasLoaded);
        a.load();
        b.load();
      });
    });
  });

  suite('getDOMAttribute', function () {
    test('returns parsed component data', function () {
      var componentData;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getDOMAttribute('geometry');
      assert.equal(componentData.width, 5);
      assert.notOk('height' in componentData);
    });

    test('returns empty object if component is at defaults', function () {
      el.setAttribute('material', '');
      assert.shallowDeepEqual(el.getDOMAttribute('material'), {});
    });

    test('returns partial component data', function () {
      var componentData;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getDOMAttribute('geometry');
      assert.equal(componentData.width, 5);
      assert.notOk('height' in componentData);
    });

    test('falls back to HTML getAttribute if not a component', function () {
      el.setAttribute('class', 'pied piper');
      assert.equal(el.getDOMAttribute('class'), 'pied piper');
    });

    test('retrieves data from a multiple component', function () {
      el.setAttribute('sound__1', {'src': 'url(mysoundfile.mp3)', autoplay: true});
      el.setAttribute('sound__2', {'src': 'url(mysoundfile.mp3)', autoplay: false});
      assert.ok(el.getDOMAttribute('sound__1'));
      assert.ok(el.getDOMAttribute('sound__2'));
      assert.notOk(el.getDOMAttribute('sound'));
      assert.equal(el.getDOMAttribute('sound__1').autoplay, true);
    });

    test('retrieves default value for single property component when ' +
         'the element attribute is set to empty string', function () {
      el.sceneEl.setAttribute('debug', '');
      assert.equal(el.sceneEl.getDOMAttribute('debug'), true);
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
      entity.addEventListener('loaded', function () {
        var childEntities = entity.getChildEntities();
        assert.equal(childEntities.length, 2);
        assert.equal(childEntities.indexOf(animationChild), -1);
        done();
      });
      document.body.appendChild(entity);
    });
  });

  suite('getObject3D', function () {
    test('returns requested object3D', function () {
      el.setAttribute('geometry', 'primitive: box; width: 5');
      assert.ok(el.getObject3D('mesh'));
    });

    test('it returns undefined for a non existing object3D', function () {
      assert.notOk(el.getObject3D('dummy'));
    });
  });

  suite('setObject3D', function () {
    test('sets an object3D for a given type', function () {
      var object3D = new THREE.Group();
      el.setObject3D('mesh', object3D);
      assert.equal(el.getObject3D('mesh'), object3D);
      assert.equal(object3D.el, el);
    });

    test('binds el to object3D children', function () {
      var parentObject = new THREE.Object3D();
      var childObject = new THREE.Object3D();
      parentObject.add(childObject);
      el.setObject3D('mesh', parentObject);
      assert.equal(el.getObject3D('mesh').children[0].el, el);
    });

    test('emits an event', function (done) {
      var mesh = new THREE.Mesh();
      el.addEventListener('object3dset', evt => {
        assert.equal(evt.detail.object, mesh);
        assert.equal(evt.detail.type, 'mesh');
        done();
      });
      el.setObject3D('mesh', mesh);
    });

    test('throws an error if object is not a THREE.Object3D', function () {
      assert.throws(() => {
        el.setObject3D('mesh', function () {});
      }, Error);
    });
  });

  suite('removeObject3D', () => {
    test('removes object3D', function () {
      el.setObject3D('mesh', new THREE.Mesh());
      el.removeObject3D('mesh', new THREE.Mesh());
      assert.notOk(el.getObject3D('mesh'));
      assert.notOk('mesh' in el.object3DMap);
    });

    test('handles trying to remove object3D that is not set', function () {
      var removeSpy = this.sinon.spy(el.object3D, 'remove');
      el.removeObject3D('foo');
      assert.notOk(removeSpy.called);
    });

    test('emits an event', function (done) {
      el.setObject3D('mesh', new THREE.Mesh());
      el.addEventListener('object3dremove', evt => {
        assert.equal(evt.detail.type, 'mesh');
        done();
      });
      el.removeObject3D('mesh');
    });
  });

  suite('getAttribute', function () {
    test('returns full component data', function () {
      var componentData;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getAttribute('geometry');
      assert.equal(componentData.primitive, 'box');
      assert.equal(componentData.width, 5);
      assert.ok('height' in componentData);
    });

    test('returns full data of a multiple component', function () {
      var componentData;
      el.setAttribute('sound__test', 'src: url(mysoundfile.mp3)');
      componentData = el.getAttribute('sound__test');
      assert.equal(componentData.src, 'mysoundfile.mp3');
      assert.equal(componentData.autoplay, false);
      assert.ok('loop' in componentData);
    });

    test('falls back to HTML getAttribute if not a component', function () {
      el.setAttribute('class', 'pied piper');
      assert.equal(el.getAttribute('class'), 'pied piper');
    });

    test('returns the component data object', function () {
      var data;
      el.setAttribute('geometry', {primitive: 'sphere', radius: 10});
      data = el.getAttribute('geometry');
      assert.ok(el.components.geometry.data === data);
    });

    test('returns position previously set with setAttribute', function () {
      el.setAttribute('position', {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
    });

    test('returns position set by modifying the object3D position', function () {
      el.object3D.position.set(1, 2, 3);
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
    });

    test('returns rotation previously set with setAttribute', function () {
      el.setAttribute('rotation', {x: 10, y: 45, z: 50});
      assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 10, y: 45, z: 50});
    });

    test('returns rotation previously set by modifying the object3D rotation', function () {
      el.object3D.rotation.set(Math.PI, Math.PI / 2, Math.PI / 4);
      assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 180, y: 90, z: 45});
    });

    test('returns rotation previously set by modifying the object3D quaternion', function () {
      var quaternion = new THREE.Quaternion();
      var euler = new THREE.Euler();
      var rotation;
      euler.order = 'YXZ';
      euler.set(Math.PI / 2, Math.PI, 0);
      quaternion.setFromEuler(euler);
      el.object3D.quaternion.copy(quaternion);
      rotation = el.getAttribute('rotation');
      assert.equal(Math.round(rotation.x), 90);
    });

    test('returns scale previously set with setAttribute', function () {
      el.setAttribute('scale', {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 2, z: 3});
    });

    test('returns scale set by modifying the object3D scale', function () {
      el.object3D.scale.set(1, 2, 3);
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 2, z: 3});
    });

    test('returns visible previously set with setAttribute', function () {
      el.setAttribute('visible', false);
      assert.equal(el.getAttribute('visible'), false);
      el.setAttribute('visible', true);
      assert.equal(el.getAttribute('visible'), true);
    });

    test('returns visible set by modifying the object3D visible', function () {
      el.object3D.visible = false;
      assert.equal(el.getAttribute('visible'), false);
      el.object3D.visible = true;
      assert.equal(el.getAttribute('visible'), true);
    });
  });

  suite('removeAttribute', function () {
    test('can remove a normal attribute', function () {
      el.setAttribute('id', 'id-entity');
      assert.equal(el.getAttribute('id'), 'id-entity');
      el.removeAttribute('id');
      assert.notOk(el.getAttribute('id'));
    });

    test('can remove a component', function () {
      el.setAttribute('material', 'color: #F0F');
      assert.ok(el.components.material);
      el.removeAttribute('material');
      assert.equal(el.getAttribute('material'), null);
      assert.notOk(el.components.material);
    });

    test('can remove a multiple component', function () {
      el.setAttribute('sound__test', 'src: url(mysoundfile.mp3)');
      assert.ok(el.components.sound__test);
      el.removeAttribute('sound__test');
      assert.equal(el.getAttribute('sound__test'), null);
      assert.notOk(el.components.sound__test);
    });

    test('can remove mixed-in component', function () {
      var mixinId = 'geometry';
      mixinFactory(mixinId, {geometry: 'primitive: box'});
      el.setAttribute('mixin', mixinId);
      el.setAttribute('geometry', 'primitive: sphere');
      assert.ok('geometry' in el.components);
      el.removeAttribute('geometry');
      assert.equal(el.getAttribute('geometry'), null);
      // Geometry still exists since it is mixed in.
      assert.notOk('geometry' in el.components);
    });

    test('resets a component property', function () {
      el.setAttribute('material', 'color: #F0F');
      assert.equal(el.getAttribute('material').color, '#F0F');
      el.removeAttribute('material', 'color');
      assert.equal(el.getAttribute('material').color, '#FFF');
    });

    test('does not remove mixed-in component', function () {
      mixinFactory('foo', {position: '1 2 3'});
      mixinFactory('bar', {scale: '1 2 3'});
      el.setAttribute('mixin', 'foo bar');
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3},
                              'Position mixin');
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 2, z: 3},
                              'Scale mixin');
      el.removeAttribute('mixin');
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 0, y: 0, z: 0},
                              'Position without mixin');
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 1, z: 1},
                              'Scale without mixin');
    });
  });

  suite('initComponent', function () {
    test('initializes component', function () {
      el.initComponent('material', 'color: #F0F; transparent: true', false);
      assert.ok(el.components.material);
    });

    test('does not initialized non-registered component', function () {
      var nativeSetAttribute = HTMLElement.prototype.setAttribute;
      this.sinon.replace(el, 'setAttribute', nativeSetAttribute);
      el.setAttribute('fake-component', 'color: #F0F;');
      el.initComponent('fake-component');
      assert.notOk(el.components.fakeComponent);
    });

    test('initializes dependency component and can set attribute', function () {
      el.initComponent('material', '', true);
      assert.shallowDeepEqual(el.getAttribute('material'), {});
    });

    test('initializes defined dependency component with setAttributes', function (done) {
      const el2 = document.createElement('a-entity');

      delete components.root;
      registerComponent('root', {
        dependencies: ['dependency']
      });

      registerComponent('dependency', {
        schema: {foo: {type: 'string'}},
        init: function () {
          assert.equal(this.data.foo, 'bar');
          delete components.root;
          delete components.dependency;
          done();
        }
      });

      // Create entity all at once with defined dependency component and component.
      el2.setAttribute('dependency', 'foo: bar');
      el2.setAttribute('root', '');
      el.appendChild(el2);
    });

    test('initializes defined dependency component with HTML', function (done) {
      var count = 0;
      delete components.root;
      registerComponent('root', {
        dependencies: ['dependency'],
        init: function () {
          count++;
          if (count === 2) {
            delete components.root;
            delete components.dependency;
            done();
          }
        }
      });

      registerComponent('dependency', {
        schema: {foo: {type: 'string'}},
        init: function () {
          assert.equal(this.data.foo, 'bar');
          count++;
          if (count === 2) {
            delete components.root;
            delete components.dependency;
            done();
          }
        }
      });

      el.innerHTML = '<a-entity root dependency="foo: bar">';
    });

    test('initializes defined dependency component with null data w/ HTML', function (done) {
      var count = 0;
      delete components.root;
      registerComponent('root', {
        dependencies: ['dependency'],
        init: function () {
          assert.equal(this.el.components.dependency.data.foo, 'bar');
          count++;
          if (count === 2) {
            delete components.root;
            delete components.dependency;
            done();
          }
        }
      });

      registerComponent('dependency', {
        schema: {foo: {default: 'bar'}},
        init: function () {
          assert.equal(this.data.foo, 'bar');
          count++;
          if (count === 2) {
            delete components.root;
            delete components.dependency;
            done();
          }
        }
      });

      el.innerHTML = '<a-entity root dependency>';
    });

    test('initializes defined dependency component with HTML reverse', function (done) {
      registerComponent('root', {
        dependencies: ['dependency']
      });

      registerComponent('dependency', {
        schema: {foo: {type: 'string'}},
        init: function () {
          assert.equal(this.data.foo, 'bar');
          delete components.root;
          delete components.dependency;
          done();
        }
      });

      el.innerHTML = '<a-entity dependency="foo: bar" root>';
    });

    test('can access dependency component data', function (done) {
      delete components.root;
      registerComponent('root', {
        dependencies: ['dependency'],

        init: function () {
          assert.equal(this.el.components.dependency.data.foo, 'bar');
          assert.equal(this.el.components.dependency.qux, 'baz');
          delete components.root;
          delete components.dependency;
          done();
        }
      });

      registerComponent('dependency', {
        schema: {foo: {type: 'string'}},
        init: function () { this.qux = 'baz'; }
      });

      el.innerHTML = '<a-entity dependency="foo: bar" root>';
    });

    test('initializes dependency component and current attribute honored', function () {
      var materialAttribute = 'color: #F0F; transparent: true';
      var nativeSetAttribute = HTMLElement.prototype.setAttribute;
      var nativeGetAttribute = HTMLElement.prototype.getAttribute;
      this.sinon.replace(el, 'setAttribute', nativeSetAttribute);
      this.sinon.replace(el, 'getAttribute', nativeGetAttribute);
      el.setAttribute('material', materialAttribute);
      el.initComponent('material', '', true);
      assert.equal(el.getAttribute('material'), materialAttribute);
    });

    test('does not initialize with id if the component is not multiple', function () {
      assert.throws(function setAttribute () {
        el.setAttribute('geometry__1', {primitive: 'box'});
      }, Error);
      assert.notOk(el.components.geometry__1);
    });

    test('initializes components with id if the component opts into multiple', function () {
      el.setAttribute('sound__1', {'src': 'url(mysoundfile.mp3)'});
      el.setAttribute('sound__2', {'src': 'url(mysoundfile.mp3)'});
      assert.ok(el.components.sound__1);
      assert.ok(el.components.sound__2);
      assert.ok(el.components.sound__1 instanceof components.sound.Component);
      assert.ok(el.components.sound__2 instanceof components.sound.Component);
    });

    test('waits for DOM data to init before setAttribute data', function (done) {
      // Test component.
      AFRAME.registerComponent('test', {
        schema: {
          foo: {default: 5},
          bar: {default: 'red'},
          qux: {default: true}
        },

        init: function () {
          var data = this.data;
          assert.equal(data.foo, 10);
          assert.equal(data.bar, 'red');
          assert.equal(data.qux, true);
        },

        update: function (oldData) {
          var data = this.data;
          if (oldData && Object.keys(oldData).length) {
            // Second update via setAttribute.
            assert.equal(data.foo, 10);
            assert.equal(data.bar, 'orange');
            assert.equal(data.qux, true);
            delete AFRAME.components['test-setter'];
            done();
          } else {
            // First update via initialization.
            assert.equal(data.foo, 10);
            assert.equal(data.bar, 'red');
            assert.equal(data.qux, true);
          }
        }
      });

      // Component that will do the setAttribute, without dependency.
      AFRAME.registerComponent('test-setter', {
        init: function () {
          this.el.setAttribute('test', {bar: 'orange'});
        }
      });

      // Create the entity.
      el.innerHTML = '<a-entity test-setter test="foo: 10">';
    });
  });

  suite('removeComponent', function () {
    test('removes a behavior', function () {
      var sceneEl = el.sceneEl;
      var component;
      el.play();
      el.setAttribute('raycaster', '');
      component = el.components['raycaster'];
      assert.notEqual(sceneEl.behaviors.tock.indexOf(component), -1);
      el.removeAttribute('raycaster');
      assert.equal(sceneEl.behaviors.tock.indexOf(component), -1);
    });

    test('waits for component to initialize', function (done) {
      var box = document.createElement('a-entity');
      var component;
      var removeSpy;

      box.setAttribute('geometry', {primitive: 'box'});
      component = box.components.geometry;
      removeSpy = this.sinon.replace(component, 'remove', this.sinon.fake(() => {}));

      box.removeComponent('geometry');
      assert.notOk(removeSpy.called);

      component.initialized = true;
      box.emit('componentinitialized', {name: 'geometry'});
      setTimeout(() => {
        assert.ok(removeSpy.called);
        done();
      });
    });
  });

  suite('updateComponent', function () {
    test('initialize a component', function () {
      assert.equal(el.components.material, undefined);
      el.updateComponent('material', {color: 'blue'});
      assert.equal(el.getAttribute('material').color, 'blue');
    });

    test('update an existing component', function () {
      var component = new components.material.Component(el, {color: 'red'});
      el.components.material = component;
      assert.equal(el.getAttribute('material').color, 'red');
      el.updateComponent('material', {color: 'blue'});
      assert.equal(component, el.components.material);
      assert.equal(el.getAttribute('material').color, 'blue');
    });

    test('removes a component', function () {
      el.components.material = new components.material.Component(el, {color: 'red'});
      assert.equal(el.getAttribute('material').color, 'red');
      el.components.material.attrValue = null;
      el.updateComponent('material', null);
      assert.equal(el.components.material, undefined);
    });
  });

  suite('updateComponents', function () {
    setup(function (done) {
      this.child = el.appendChild(document.createElement('a-entity'));
      this.child.addEventListener('loaded', function () {
        done();
      });
    });

    test('nested calls do not leak components to children', function () {
      registerComponent('test', {
        init: function () {
          var children = el.getChildEntities();
          if (children.length) {
            children[0].setAttribute('mixin', 'addGeometry');
          }
        }
      });
      mixinFactory('addTest', {test: ''});
      mixinFactory('addGeometry', {geometry: 'shape: sphere'});
      el.setAttribute('mixin', 'addTest');
      assert.notOk(this.child.components['test']);
    });

    test('initializes object3d components first', function (done) {
      registerComponent('test', {
        init: function () {
          var object3D = this.el.object3D;
          assert.equal(object3D.position.y, 5);
          assert.equal(object3D.visible, false);
          done();
        }
      });

      el.innerHTML = '<a-entity class="test" test position="0 5 0" visible="false"></a-entity';
    });
  });

  suite('applyMixin', function () {
    test('combines mixin and element components with a dynamic schema', function () {
      var mixinId = 'material';
      mixinFactory(mixinId, {material: 'shader: flat'});
      el.setAttribute('mixin', mixinId);
      el.setAttribute('material', 'color: red');
      assert.shallowDeepEqual(el.getAttribute('material'), {shader: 'flat', color: 'red'});
    });

    test('merges component properties from mixin', function (done) {
      mixinFactory('box', {geometry: 'primitive: box'});
      process.nextTick(function () {
        el.setAttribute('mixin', 'box');
        el.setAttribute('geometry', {depth: 5, height: 5, width: 5});
        assert.shallowDeepEqual(el.getAttribute('geometry'), {
          depth: 5,
          height: 5,
          primitive: 'box',
          width: 5
        });
        done();
      });
    });

    test('applies default vec3 component from mixin', function () {
      var mixinId = 'position';
      mixinFactory(mixinId, {position: '1 2 3'});
      el.setAttribute('mixin', mixinId);
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
    });

    test('does not override defined property', function () {
      el.setAttribute('material', {color: 'red'});
      mixinFactory('blue', {material: 'color: blue'});
      el.setAttribute('mixin', 'blue');
      assert.shallowDeepEqual(el.getAttribute('material').color, 'red');
    });

    test('does not override defined property on subsequent updates', function () {
      el.setAttribute('material', {color: 'red'});
      mixinFactory('blue', {material: 'color: blue'});
      mixinFactory('opacity', {opacity: 0.25});

      el.setAttribute('mixin', 'blue');
      assert.equal(el.getAttribute('material').color, 'red');

      el.setAttribute('material', {opacity: 0.5});
      assert.equal(el.getAttribute('material').color, 'red');
      assert.equal(el.getAttribute('material').opacity, 0.5);

      el.setAttribute('mixin', 'blue opacity');
      assert.equal(el.getAttribute('material').color, 'red');
      assert.equal(el.getAttribute('material').opacity, 0.5);

      el.setAttribute('material', {side: 'back'});
      assert.equal(el.getAttribute('material').color, 'red');
      assert.equal(el.getAttribute('material').opacity, 0.5);
    });

    test('applies multiple components from mixin', function () {
      var mixinId = 'sound';
      var soundUrl = 'mysoundfile.mp3';
      mixinFactory(mixinId, {
        sound__1: 'src: url(' + soundUrl + '); autoplay: false',
        sound__2: 'src: url(' + soundUrl + '); autoplay: true'
      });
      el.setAttribute('mixin', mixinId);
      assert.equal(el.getAttribute('sound__1').src, soundUrl);
      assert.equal(el.getAttribute('sound__1').autoplay, false);
      assert.equal(el.getAttribute('sound__2').src, soundUrl);
      assert.equal(el.getAttribute('sound__2').autoplay, true);
    });

    test('applies mixin ids separated with spaces, tabs, and new lines', function () {
      mixinFactory('material', {material: 'shader: flat'});
      mixinFactory('position', {position: '1 2 3'});
      mixinFactory('rotation', {rotation: '10 20 45'});
      el.setAttribute('mixin', '  material\t\nposition \t  rotation\n  ');
      el.setAttribute('material', 'color: red');
      assert.equal(el.mixinEls.length, 3);
      assert.shallowDeepEqual(el.getAttribute('material'), {shader: 'flat', color: 'red'});
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 10, y: 20, z: 45});
    });

    test('clear mixin', function () {
      mixinFactory('material', {material: 'shader: flat'});
      mixinFactory('position', {position: '1 2 3'});
      el.setAttribute('mixin', 'material position');
      el.setAttribute('material', 'color: red');
      assert.shallowDeepEqual(el.getAttribute('material'), {shader: 'flat', color: 'red'});
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
      assert.equal(el.mixinEls.length, 2);
      el.setAttribute('mixin', '');
      assert.shallowDeepEqual(el.getAttribute('material'), {color: 'red'});
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 0, y: 0, z: 0});
      assert.equal(el.mixinEls.length, 0);
    });

    test('remove mixin', function (done) {
      registerComponent('test', {
        remove: function () {
          // Should be called or else will timeout.
          done();
        }
      });
      mixinFactory('test', {test: ''});
      setTimeout(() => {
        el.setAttribute('mixin', 'test');
        assert.equal(el.mixinEls.length, 1);
        el.setAttribute('mixin', '');
        assert.equal(el.mixinEls.length, 0);
      });
    });

    /**
     * Fixed a weird case where attributeChangedCallback on mixin was fired during scene init.
     * That fired mixinUpdate before the entity was loaded (and el.sceneEl was undefined).
     * And tried to update components before the entity was ready.
     * This test mimics that state where mixinUpdate called when entity not fully loaded but
     * component is still initializing.
     */
    test('wait for entity to load on mixin update', function (done) {
      const TestComponent = AFRAME.registerComponent('test', {
        update: function () {
          assert.ok(this.el.sceneEl);
          done();
        }
      });

      elFactory().then(someEl => {
        const sceneEl = someEl.sceneEl;

        const mixin = document.createElement('a-mixin');
        mixin.setAttribute('id', 'foo');
        mixin.setAttribute('test', '');
        sceneEl.appendChild(mixin);

        setTimeout(() => {
          const el = document.createElement('a-entity');
          el.setAttribute('mixin', 'foo');
          el.components.test = new TestComponent(el, {}, '');
          el.components.test.oldData = 'foo';
          el.mixinUpdate('foo');
          sceneEl.appendChild(el);
        });
      });
    });
  });
});

suite('a-entity component lifecycle management', function () {
  var el;

  setup(function (done) {
    elFactory().then(_el => {
      el = _el;
      components.test = undefined;
      this.TestComponent = registerComponent('test', TestComponent);
      done();
    });
  });

  teardown(function () {
    components.test = undefined;
  });

  test('calls init on component attach', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'init');
    sinon.assert.notCalled(TestComponent.init);
    el.setAttribute('test', '');
    sinon.assert.called(TestComponent.init);
  });

  test('calls init only once', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'init');
    el.setAttribute('test', '');
    sinon.assert.calledOnce(TestComponent.init);
    el.setAttribute('test', 'a: 5');
    sinon.assert.calledOnce(TestComponent.init);
  });

  test('calls update on component attach', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'update');
    sinon.assert.notCalled(TestComponent.update);
    el.setAttribute('test', '');
    sinon.assert.called(TestComponent.update);
  });

  test('calls update on setAttribute', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'update');
    el.setAttribute('test', '');
    sinon.assert.calledOnce(TestComponent.update);
    el.setAttribute('test', 'a: 5');
    sinon.assert.calledTwice(TestComponent.update);
  });

  test('does not call update on setAttribute if no change', function () {
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'update');
    el.setAttribute('test', 'a: 3');
    sinon.assert.calledOnce(TestComponent.update);
    el.setAttribute('test', 'a: 3');
    sinon.assert.calledOnce(TestComponent.update);
  });

  test('parses if mix of unparsed data and reused object from setAttribute', function (done) {
    var componentData;
    var childEl;
    var parentEl = el;
    var updateObj = {b: 5};

    AFRAME.registerComponent('setter', {
      init: function () {
        setTimeout(() => {
          this.el.setAttribute('test', updateObj);
          updateObj.b = 10;
          this.el.setAttribute('test', updateObj);
        });
      }
    });

    parentEl.innerHTML = '<a-entity setter test="a: 3">';

    setTimeout(() => {
      childEl = parentEl.children[0];
      componentData = childEl.getAttribute('test');
      assert.strictEqual(componentData.a, 3);
      assert.strictEqual(componentData.b, 10);
      delete AFRAME.components.setter;
      done();
    }, 50);
  });

  test('calls remove on removeAttribute', function () {
    var TestComponent = this.TestComponent.prototype;
    this.sinon.spy(TestComponent, 'remove');
    el.setAttribute('test', '');
    sinon.assert.notCalled(TestComponent.remove);
    el.removeAttribute('test');
    sinon.assert.called(TestComponent.remove);
  });

  test('calls pause on entity pause', function () {
    var TestComponent = this.TestComponent.prototype;
    this.sinon.spy(TestComponent, 'pause');
    el.play();
    el.setAttribute('test', '');
    sinon.assert.notCalled(TestComponent.pause);
    el.pause();
    sinon.assert.called(TestComponent.pause);
  });

  test('calls play on entity play', function () {
    var TestComponent = this.TestComponent.prototype;
    el.pause();
    this.sinon.spy(TestComponent, 'play');
    el.setAttribute('test', '');
    sinon.assert.notCalled(TestComponent.play);
    el.play();
    sinon.assert.called(TestComponent.play);
  });

  test('removes tick from scene behaviors on entity pause', function () {
    var testComponentInstance;
    el.setAttribute('test', '');
    testComponentInstance = el.components.test;
    assert.notEqual(el.sceneEl.behaviors.tick.indexOf(testComponentInstance), -1);
    el.pause();
    assert.equal(el.sceneEl.behaviors.tick.indexOf(testComponentInstance), -1);
  });

  test('adds tick to scene behaviors on entity play', function () {
    var testComponentInstance;
    el.setAttribute('test', '');
    testComponentInstance = el.components.test;
    el.sceneEl.behaviors.tick = [];
    assert.equal(el.sceneEl.behaviors.tick.indexOf(testComponentInstance), -1);
    el.play();
    assert.equal(el.sceneEl.behaviors.tick.indexOf(testComponentInstance), -1);
  });

  test('removes tock from scene behaviors on entity pause', function () {
    var testComponentInstance;
    el.setAttribute('test', '');
    testComponentInstance = el.components.test;
    assert.notEqual(el.sceneEl.behaviors.tock.indexOf(testComponentInstance), -1);
    el.pause();
    assert.equal(el.sceneEl.behaviors.tock.indexOf(testComponentInstance), -1);
  });

  test('adds tock to scene behaviors on entity play', function () {
    var testComponentInstance;
    el.setAttribute('test', '');
    testComponentInstance = el.components.test;
    el.sceneEl.behaviors.tock = [];
    assert.equal(el.sceneEl.behaviors.tock.indexOf(testComponentInstance), -1);
    el.play();
    assert.equal(el.sceneEl.behaviors.tock.indexOf(testComponentInstance), -1);
  });

  suite('remove', function () {
    test('detaches if called with no arguments', function (done) {
      el.remove();
      setTimeout(() => {
        assert.notOk(el.parentNode);
        done();
      });
    });

    test('detaches child object3D if called with child', function (done) {
      const childrenLength = el.parentNode.object3D.children.length;
      el.parentNode.remove(el);
      setTimeout(() => {
        assert.ok(el.parentNode.object3D.children.length < childrenLength);
        done();
      });
    });
  });

  suite('destroy', function () {
    test('does not destroy components if still attached', function () {
      el.setAttribute('test', '');
      const destroySpy = this.sinon.spy(el.components.test, 'destroy');
      el.destroy();
      assert.notOk(destroySpy.callCount);
    });

    test('destroys components if destroyed', function () {
      el.setAttribute('test', '');
      el.parentNode.removeChild(el);
      const destroySpy = this.sinon.spy(el.components.test, 'destroy');
      el.destroy();
      assert.ok(destroySpy.callCount);
    });
  });
});

suite('a-entity component dependency management', function () {
  var el;

  setup(function (done) {
    var componentNames = ['codependency', 'dependency', 'nested-dependency', 'test'];
    var componentProto;

    componentNames.forEach(function clearComponent (componentName) {
      components[componentName] = undefined;
    });

    /**
     * root
     *   dependency
     *     nestedDependency
     *   codependency
     */
    componentProto = extend({}, TestComponent);
    var RootComponent = registerComponent('root', extend(componentProto, {
      dependencies: ['dependency', 'codependency']
    }));
    this.rootInit = this.sinon.spy(RootComponent.prototype, 'init');

    componentProto = extend({}, TestComponent);
    this.DependencyComponent = registerComponent('dependency', extend(componentProto, {
      dependencies: ['nested-dependency']
    }));
    this.dependencyInit = this.sinon.spy(this.DependencyComponent.prototype, 'init');

    componentProto = extend({}, TestComponent);
    var CodependencyComponent = registerComponent('codependency', extend(componentProto, {
      dependencies: []
    }));
    this.codependencyInit = this.sinon.spy(CodependencyComponent.prototype, 'init');

    componentProto = extend({}, TestComponent);
    var NestedDependency = registerComponent('nested-dependency', componentProto);
    this.nestedDependencyInit = this.sinon.spy(NestedDependency.prototype, 'init');

    elFactory().then(_el => {
      el = _el;
      done();
    });
  });

  teardown(function () {
    components.root = undefined;
    components.codependency = undefined;
    components.dependency = undefined;
    components['nested-dependency'] = undefined;
  });

  test('initializes dependency components', function () {
    el.setAttribute('root', '');
    assert.ok('root' in el.components);
    assert.ok('dependency' in el.components);
    assert.ok('codependency' in el.components);
    assert.ok('nested-dependency' in el.components);
  });

  test('only initializes each component once', function () {
    el.setAttribute('root', '');
    assert.equal(this.rootInit.callCount, 1);
    assert.equal(this.dependencyInit.callCount, 1);
    assert.equal(this.codependencyInit.callCount, 1);
    assert.equal(this.nestedDependencyInit.callCount, 1);
  });

  test('initializes dependency components when not yet loaded', function () {
    el.setAttribute('root', '');
    assert.ok('root' in el.components);
    assert.ok('dependency' in el.components);
    assert.ok('codependency' in el.components);
    assert.ok('nested-dependency' in el.components);
  });

  test('initializes components (calling .init()) in the correct order', function (done) {
    elFactory().then(el => {
      el.setAttribute('root', '');
      sinon.assert.callOrder(
        this.nestedDependencyInit,
        this.dependencyInit,
        this.codependencyInit,
        this.rootInit
      );
      done();
    });
  });

  test('initializes components (calling .init()) in the correct order via HTML', function (done) {
    elFactory().then(parentEl => {
      parentEl.addEventListener('child-attached', evt => {
        evt.detail.el.addEventListener('loaded', () => {
          sinon.assert.callOrder(
            this.nestedDependencyInit,
            this.dependencyInit,
            this.codependencyInit,
            this.rootInit
          );
          done();
        });
      });
      parentEl.innerHTML = '<a-entity root></a-entity>';
    });
  });
});
