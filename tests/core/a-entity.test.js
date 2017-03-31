/* global AFRAME, assert, process, sinon, setup, suite, teardown, test, HTMLElement */
var AEntity = require('core/a-entity');
var ANode = require('core/a-node');
var extend = require('utils').extend;
var registerComponent = require('core/component').registerComponent;
var components = require('core/component').components;
var THREE = require('index').THREE;
var helpers = require('../helpers');

var entityFactory = helpers.entityFactory;
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
  tick: function () { }
};

suite('a-entity', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  teardown(function () {
    components.test = undefined;
  });

  test('createdCallback', function () {
    var el = this.el;
    assert.ok(el.isNode);
    assert.ok(el.isEntity);
  });

  test('adds itself to parent when attached', function (done) {
    var el = document.createElement('a-entity');
    var parentEl = this.el;
    el.object3D = new THREE.Mesh();
    parentEl.appendChild(el);
    el.addEventListener('loaded', function () {
      assert.equal(parentEl.object3D.children[0].uuid, el.object3D.uuid);
      assert.ok(el.parentEl);
      assert.ok(el.parentNode);
      done();
    });
  });

  test('emits event when child attached', function (done) {
    var el = document.createElement('a-entity');
    var parentEl = this.el;
    el.object3D = new THREE.Mesh();
    parentEl.addEventListener('child-attached', function (event) {
      assert.equal(event.detail.el, el);
      done();
    });
    parentEl.appendChild(el);
  });

  test('emits `componentremoved` event when element itself has been removed', function (done) {
    var el = this.el;
    el.setAttribute('geometry', 'primitive:plane');
    el.addEventListener('componentremoved', function (event) {
      assert.equal(event.detail.name, 'geometry');
      done();
    });
    el.removeAttribute('geometry');
  });

  test('can be detached and re-attached safely', function (done) {
    var el = document.createElement('a-entity');
    var parentEl = this.el;
    el.object3D = new THREE.Mesh();
    el.setAttribute('geometry', 'primitive:plane');
    parentEl.appendChild(el);
    el.addEventListener('loaded', afterFirstAttachment);

    function afterFirstAttachment () {
      el.removeEventListener('loaded', afterFirstAttachment);

      assert.equal(parentEl.object3D.children[0].uuid, el.object3D.uuid);
      assert.ok(el.parentEl);
      assert.ok(el.parentNode);
      assert.ok(el.components.geometry);
      assert.isTrue(el.hasLoaded);

      parentEl.removeChild(el);
      process.nextTick(afterDetachment);
    }

    function afterDetachment () {
      assert.equal(parentEl.object3D.children.length, 0);
      assert.notOk(el.parentEl);
      assert.notOk(el.parentNode);
      assert.notOk(el.components.geometry);
      assert.isFalse(el.hasLoaded);

      parentEl.appendChild(el);
      el.addEventListener('loaded', afterSecondAttachment);
    }

    function afterSecondAttachment () {
      el.removeEventListener('loaded', afterSecondAttachment);

      assert.equal(parentEl.object3D.children[0].uuid, el.object3D.uuid);
      assert.ok(el.parentEl);
      assert.ok(el.parentNode);
      assert.ok(el.components.geometry);
      assert.isTrue(el.hasLoaded);

      done();
    }
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
        process.nextTick(function () {
          sinon.assert.called(AEntity.prototype.load);
          done();
        });
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

    test('is playing when loaded', function (done) {
      var el = document.createElement('a-entity');

      el.addEventListener('loaded', function () {
        assert.ok(el.isPlaying);
        done();
      });
      this.el.sceneEl.appendChild(el);
    });

    test('plays when entity is attached after scene load', function (done) {
      var el = document.createElement('a-entity');
      this.sinon.spy(AEntity.prototype, 'play');

      el.addEventListener('play', function () {
        assert.ok(el.hasLoaded);
        sinon.assert.called(AEntity.prototype.play);
        done();
      });
      this.el.sceneEl.appendChild(el);
    });

    test('waits for <a-assets>', function (done) {
      var assetsEl;
      var el;
      var img;
      var sceneEl;

      // Create DOM.
      sceneEl = document.createElement('a-scene');
      assetsEl = document.createElement('a-assets');
      img = document.createElement('img');
      img.setAttribute('src', 'willneverload.jpg');
      el = document.createElement('a-entity');
      assetsEl.appendChild(img);
      sceneEl.appendChild(assetsEl);
      sceneEl.appendChild(el);
      document.body.appendChild(sceneEl);

      el.addEventListener('loaded', function () {
        assert.ok(assetsEl.hasLoaded);
        assert.ok(el.hasLoaded);
        done();
      });
      ANode.prototype.load.call(assetsEl);
    });
  });

  suite('addState', function () {
    test('adds state', function () {
      var el = this.el;
      el.states = [];
      el.addState('happy');
      assert.ok(el.states[0] === 'happy');
    });

    test('it does not add an existing state', function () {
      var el = this.el;
      el.states = ['happy'];
      el.addState('happy');
      assert.ok(el.states.length === 1);
    });
  });

  suite('removeState', function () {
    test('removes existing state', function () {
      var el = this.el;
      el.states = ['happy'];
      el.removeState('happy');
      assert.ok(el.states.length === 0);
    });

    test('removes non existing state', function () {
      var el = this.el;
      el.states = ['happy'];
      el.removeState('sad');
      assert.ok(el.states.length === 1);
    });

    test('removes existing state among multiple states', function () {
      var el = this.el;
      el.states = ['happy', 'excited'];
      el.removeState('excited');
      assert.equal(el.states.length, 1);
      assert.ok(el.states[0] === 'happy');
    });
  });

  suite('is', function () {
    test('returns true if entity is in the given state', function () {
      var el = this.el;
      el.states = ['happy'];
      el.is('happy');
      assert.ok(el.is('happy'));
    });

    test('returns false if entity is not in the given state', function () {
      var el = this.el;
      el.states = ['happy'];
      el.is('happy');
      assert.ok(el.is('happy'));
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
      var value = {color: '#F0F', metalness: 0.75};
      el.setAttribute('material', value);
      material = el.getAttribute('material');
      assert.equal(material.color, '#F0F');
      assert.equal(material.metalness, 0.75);
    });

    test('can clobber component attributes with an object and flag', function () {
      var el = this.el;
      var material;
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      el.setAttribute('material', {color: '#000'}, true);
      material = el.getAttribute('material');
      assert.equal(material.color, '#000');
      assert.equal(material.roughness, 0.5);
      assert.equal(el.getDOMAttribute('material').roughness, undefined);
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
      var positionObj = {x: 10, y: 20, z: 30};
      el.setAttribute('position', positionObj);
      assert.ok(el.outerHTML.indexOf('position=""') !== -1);
    });

    test('can update component data', function () {
      var el = this.el;
      el.setAttribute('position', '10 20 30');
      assert.deepEqual(el.getAttribute('position'), {x: 10, y: 20, z: 30});

      el.setAttribute('position', {x: 30, y: 20, z: 10});
      assert.deepEqual(el.getAttribute('position'), {x: 30, y: 20, z: 10});
    });

    test('can partially update multiple properties of a component', function () {
      var el = this.el;
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
      this.el.setAttribute('test', {array: sourceArray});
      assert.strictEqual(this.el.getAttribute('test').array, sourceArray);
    });

    test('partial updates of array-type properties do not trigger update', function () {
      // Updates to array do not trigger update handler.
      var updateSpy;
      registerComponent('test', {
        schema: {array: {type: 'array'}},
        update: function () { /* no-op */ }
      });
      this.el.setAttribute('test', {arr: [1, 2, 3]});
      updateSpy = this.sinon.spy(this.el.components.test, 'update');
      // setAttribute does not trigger update because utils.extendDeep
      // called by componentUpdate assigns the new value directly into the
      // component data
      this.el.setAttribute('test', {arr: [4, 5, 6]});
      assert.isFalse(updateSpy.called);
    });

    test('can partially update vec3', function () {
      var el = this.el;
      el.setAttribute('position', {y: 20});
      assert.deepEqual(el.getAttribute('position'), {x: 0, y: 20, z: 0});
    });

    test('can update component property with asymmetrical property type', function () {
      var el = this.el;
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
      var el = this.el;
      el.setAttribute('geometry', {primitive: 'box'});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'box'});
      el.setAttribute('geometry', {primitive: 'sphere', radius: 10});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'sphere', radius: 10});
    });

    test('only caches modified properties when changing schema only', function () {
      var el = this.el;
      var geometry;
      el.setAttribute('geometry', {primitive: 'box'});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'box'});
      el.setAttribute('geometry', {primitive: 'sphere', radius: 10});
      assert.deepEqual(el.components.geometry.attrValue, {primitive: 'sphere', radius: 10});
      geometry = el.getAttribute('geometry');
      assert.equal(geometry.primitive, 'sphere');
      assert.equal(geometry.radius, 10);
      assert.notOk(geometry.depth);
      assert.notOk(geometry.height);
      assert.notOk(geometry.width);
    });

    test('parses individual properties when passing object', function (done) {
      var el = this.el;
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
  });

  suite('flushToDOM', function () {
    test('updates DOM attributes', function () {
      var el = this.el;
      var materialStr = 'color:#F0F;metalness:0.75';
      var material;
      el.setAttribute('material', materialStr);
      material = HTMLElement.prototype.getAttribute.call(el, 'material');
      assert.equal(material, '');
      el.flushToDOM();
      material = HTMLElement.prototype.getAttribute.call(el, 'material');
      assert.equal(material, materialStr);
    });

    test('updates DOM attributes of a multiple component', function () {
      var el = this.el;
      var soundStr = 'src:url(mysoundfile.mp3);autoplay:true';
      var soundAttrValue;
      el.setAttribute('sound__1', {'src': 'url(mysoundfile.mp3)', autoplay: true});
      soundAttrValue = HTMLElement.prototype.getAttribute.call(el, 'sound__1');
      assert.equal(soundAttrValue, '');
      el.flushToDOM();
      soundAttrValue = HTMLElement.prototype.getAttribute.call(el, 'sound__1');
      assert.equal(soundAttrValue, soundStr);
    });

    test('updates DOM attributes recursively', function (done) {
      var el = this.el;
      var childEl = document.createElement('a-entity');
      var childMaterialStr = 'color:pink';
      var materialAttr;
      var materialStr = 'color:#F0F;metalness:0.75';
      childEl.addEventListener('loaded', function () {
        materialAttr = HTMLElement.prototype.getAttribute.call(el, 'material');
        assert.equal(materialAttr, null);
        materialAttr = HTMLElement.prototype.getAttribute.call(childEl, 'material');
        assert.equal(materialAttr, null);
        el.setAttribute('material', materialStr);
        childEl.setAttribute('material', childMaterialStr);
        el.flushToDOM(true);
        materialAttr = HTMLElement.prototype.getAttribute.call(el, 'material');
        assert.equal(materialAttr, 'color:#F0F;metalness:0.75');
        materialAttr = HTMLElement.prototype.getAttribute.call(childEl, 'material');
        assert.equal(childMaterialStr, 'color:pink');
        done();
      });
      el.appendChild(childEl);
    });

    test('flushes default component values', function (done) {
      var parentEl = this.el;
      var el = document.createElement('a-entity');
      el.addEventListener('loaded', function () {
        el.flushToDOM();
        assert.equal(HTMLElement.prototype.getAttribute.call(el, 'position'), '0 0 0');
        assert.equal(HTMLElement.prototype.getAttribute.call(el, 'rotation'), '0 0 0');
        assert.equal(HTMLElement.prototype.getAttribute.call(el, 'scale'), '1 1 1');
        assert.equal(HTMLElement.prototype.getAttribute.call(el, 'visible'), 'true');
        done();
      });
      parentEl.appendChild(el);
    });
  });

  suite('detachedCallback', function () {
    test('removes itself from entity parent', function (done) {
      var parentEl = entityFactory();
      var el = document.createElement('a-entity');

      el.addEventListener('loaded', function () {
        parentEl.removeChild(el);
        process.nextTick(function () {
          assert.equal(parentEl.object3D.children.length, 0);
          assert.notOk(el.parentEl);
          assert.notOk(el.parentNode);
          done();
        });
      });

      parentEl.appendChild(el);
    });

    test('removes itself from scene parent', function (done) {
      var el = this.el;
      var parentEl = el.parentNode;
      assert.notEqual(parentEl.object3D.children.indexOf(el.object3D), -1);
      process.nextTick(function () {
        assert.equal(parentEl.object3D.children.indexOf(el.object3D), -1);
        done();
      });
      parentEl.removeChild(el);
    });

    test('properly detaches components', function (done) {
      var el = this.el;
      var parentEl = el.parentNode;
      components.test = undefined;
      registerComponent('test', TestComponent);
      el.setAttribute('test', '');
      assert.notEqual(el.sceneEl.behaviors.indexOf(el.components.test), -1);
      parentEl.removeChild(el);
      process.nextTick(function () {
        assert.notOk('test' in el.components);
        assert.equal(el.sceneEl.behaviors.indexOf(el.components.test), -1);
        done();
      });
    });
  });

  suite('load', function () {
    test('does not try to load if not attached', function () {
      var el = document.createElement('a-entity');
      var nodeLoadSpy = this.sinon.spy(ANode.prototype, 'load');
      el.load();
      assert.notOk(nodeLoadSpy.called);
    });

    test('does not try to initialized during load callback if not attached', function (done) {
      var childEl = document.createElement('a-entity');
      var el = document.createElement('a-entity');
      var nodeLoadSpy;

      el.parentEl = true;
      el.appendChild(childEl);
      el.load();
      el.parentEl = null;
      childEl.emit('loaded');

      nodeLoadSpy = this.sinon.spy(AEntity.prototype, 'updateComponents');
      setTimeout(function () {
        assert.notOk(nodeLoadSpy.called);
        done();
      });
    });
  });

  suite('getDOMAttribute', function () {
    test('returns parsed component data', function () {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getDOMAttribute('geometry');
      assert.equal(componentData.width, 5);
      assert.notOk('height' in componentData);
    });

    test('returns empty object if component is at defaults', function () {
      var el = this.el;
      el.setAttribute('material', '');
      assert.shallowDeepEqual(el.getDOMAttribute('material'), {});
    });

    test('returns null for a default component if it is not set', function () {
      var el = this.el;
      assert.shallowDeepEqual(el.getDOMAttribute('position'), null);
    });

    test('returns parsed data if default component is set', function () {
      var el = this.el;
      var position = {x: 5, y: 6, z: 6};
      el.setAttribute('position', position);
      assert.shallowDeepEqual(el.getDOMAttribute('position'), position);
    });

    test('returns partial component data', function () {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getDOMAttribute('geometry');
      assert.equal(componentData.width, 5);
      assert.notOk('height' in componentData);
    });

    test('falls back to HTML getAttribute if not a component', function () {
      var el = this.el;
      el.setAttribute('class', 'pied piper');
      assert.equal(el.getDOMAttribute('class'), 'pied piper');
    });

    test('retrieves data from a multiple component', function () {
      var el = this.el;
      el.setAttribute('sound__1', {'src': 'url(mysoundfile.mp3)', autoplay: true});
      el.setAttribute('sound__2', {'src': 'url(mysoundfile.mp3)', autoplay: false});
      assert.ok(el.getDOMAttribute('sound__1'));
      assert.ok(el.getDOMAttribute('sound__2'));
      assert.notOk(el.getDOMAttribute('sound'));
      assert.equal(el.getDOMAttribute('sound__1').autoplay, true);
    });

    test('retrieves default value for single property component when ' +
         'the element attribute is set to empty string', function () {
      var sceneEl = this.el.sceneEl;
      sceneEl.setAttribute('debug', '');
      assert.equal(sceneEl.getDOMAttribute('debug'), true);
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
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      assert.ok(el.getObject3D('mesh'));
    });

    test('it returns undefined for a non existing object3D', function () {
      assert.notOk(this.el.getObject3D('dummy'));
    });
  });

  suite('setObject3D', function () {
    test('sets an object3D for a given type', function () {
      var el = this.el;
      var object3D = new THREE.Group();
      el.setObject3D('mesh', object3D);
      assert.equal(el.getObject3D('mesh'), object3D);
      assert.equal(object3D.el, el);
    });

    test('binds el to object3D children', function () {
      var el = this.el;
      var parentObject = new THREE.Object3D();
      var childObject = new THREE.Object3D();
      parentObject.add(childObject);
      el.setObject3D('mesh', parentObject);
      assert.equal(el.getObject3D('mesh').children[0].el, el);
    });

    test('emits an event', function (done) {
      var el = this.el;
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
        this.el.setObject3D('mesh', function () {});
      }, Error);
    });
  });

  suite('removeObject3D', () => {
    test('removes object3D', function () {
      var el = this.el;
      el.setObject3D('mesh', new THREE.Mesh());
      el.removeObject3D('mesh', new THREE.Mesh());
      assert.notOk(el.getObject3D('mesh'));
      assert.notOk('mesh' in el.object3DMap);
    });

    test('handles trying to remove object3D that is not set', function () {
      var el = this.el;
      var removeSpy = this.sinon.spy(el.object3D, 'remove');
      el.removeObject3D('foo');
      assert.notOk(removeSpy.called);
    });

    test('emits an event', function (done) {
      var el = this.el;
      el.setObject3D('mesh', new THREE.Mesh());
      el.addEventListener('object3dremove', evt => {
        assert.equal(evt.detail.type, 'mesh');
        done();
      });
      el.removeObject3D('mesh');
    });
  });

  suite('getOrCreateObject3D', function () {
    test('creates an object3D if the type does not exist', function () {
      var el = this.el;
      el.getOrCreateObject3D('mesh', THREE.Object3D);
      assert.ok(el.getObject3D('mesh'));
      assert.equal(el.getObject3D('mesh').constructor, THREE.Object3D);
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

  suite('getAttribute', function () {
    test('returns full component data', function () {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      componentData = el.getAttribute('geometry');
      assert.equal(componentData.primitive, 'box');
      assert.equal(componentData.width, 5);
      assert.ok('height' in componentData);
    });

    test('returns default value on a default component not set', function () {
      var el = this.el;
      var defaultPosition = {x: 0, y: 0, z: 0};
      var elPosition = el.getAttribute('position');
      assert.shallowDeepEqual(elPosition, defaultPosition);
    });

    test('returns full data of a multiple component', function () {
      var componentData;
      var el = this.el;
      el.setAttribute('sound__test', 'src: url(mysoundfile.mp3)');
      componentData = el.getAttribute('sound__test');
      assert.equal(componentData.src, 'mysoundfile.mp3');
      assert.equal(componentData.autoplay, false);
      assert.ok('loop' in componentData);
    });

    test('falls back to HTML getAttribute if not a component', function () {
      var el = this.el;
      el.setAttribute('class', 'pied piper');
      assert.equal(el.getAttribute('class'), 'pied piper');
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
      assert.equal(el.getAttribute('material'), null);
      assert.notOk(el.components.material);
    });

    test('can remove a multiple component', function () {
      var el = this.el;
      el.setAttribute('sound__test', 'src: url(mysoundfile.mp3)');
      assert.ok(el.components.sound__test);
      el.removeAttribute('sound__test');
      assert.equal(el.getAttribute('sound__test'), null);
      assert.notOk(el.components.sound__test);
    });

    test('does not remove default component', function () {
      var el = this.el;
      assert.ok('position' in el.components);
      el.removeAttribute('position');
      assert.equal(el.getDOMAttribute('position'), null);
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
      assert.notEqual(el.getAttribute('geometry'), null);
      // Geometry still exists since it is mixed in.
      assert.ok('geometry' in el.components);
    });

    test('resets a component property', function () {
      var el = this.el;
      el.setAttribute('material', 'color: #F0F');
      assert.equal(el.getAttribute('material').color, '#F0F');
      el.removeAttribute('material', 'color');
      assert.equal(el.getAttribute('material').color, '#FFF');
    });

    test('can clear mixins', function () {
      var el = this.el;
      mixinFactory('foo', {position: '1 2 3'});
      mixinFactory('bar', {scale: '1 2 3'});
      el.setAttribute('mixin', 'foo bar');
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 2, z: 3});
      el.removeAttribute('mixin');
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 0, y: 0, z: 0});
      assert.shallowDeepEqual(el.getAttribute('scale'), {x: 1, y: 1, z: 1});
    });
  });

  suite('initComponent', function () {
    test('initializes component', function () {
      var el = this.el;
      el.initComponent('material', false, 'color: #F0F; transparent: true');
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
      el.initComponent('material', undefined, true);
      assert.shallowDeepEqual(el.getAttribute('material'), {});
    });

    test('initializes defined dependency component with setAttributes', function (done) {
      var el = document.createElement('a-entity');

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
      el.setAttribute('dependency', 'foo: bar');
      el.setAttribute('root', '');
      this.el.appendChild(el);
    });

    test('initializes defined dependency component with HTML', function (done) {
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

      this.el.innerHTML = '<a-entity root dependency="foo: bar">';
    });

    test('initializes defined dependency component with null data w/ HTML', function (done) {
      registerComponent('root', {
        dependencies: ['dependency'],
        init: function () {
          assert.equal(this.el.components.dependency.data.foo, 'bar');
          delete components.root;
          delete components.dependency;
          done();
        }
      });

      registerComponent('dependency', {
        schema: {foo: {default: 'bar'}},
        init: function () {
          assert.equal(this.data.foo, 'bar');
        }
      });

      this.el.innerHTML = '<a-entity root dependency>';
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

      this.el.innerHTML = '<a-entity dependency="foo: bar" root>';
    });

    test('can access dependency component data', function (done) {
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

      this.el.innerHTML = '<a-entity dependency="foo: bar" root>';
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

    test('does not initialize with id if the component is not multiple', function () {
      var el = this.el;
      assert.throws(function setAttribute () {
        el.setAttribute('geometry__1', {primitive: 'box'});
      }, Error);
      assert.notOk(el.components.geometry__1);
    });

    test('initializes components with id if the component opts into multiple', function () {
      var el = this.el;
      el.setAttribute('sound__1', {'src': 'url(mysoundfile.mp3)'});
      el.setAttribute('sound__2', {'src': 'url(mysoundfile.mp3)'});
      assert.ok(el.components.sound__1);
      assert.ok(el.components.sound__2);
      assert.ok(el.components.sound__1 instanceof components.sound.Component);
      assert.ok(el.components.sound__2 instanceof components.sound.Component);
    });
  });

  suite('removeComponent', function () {
    test('removes a behavior', function () {
      var el = this.el;
      var sceneEl = el.sceneEl;
      var component;
      el.play();
      el.setAttribute('look-controls', '');
      component = el.components['look-controls'];
      assert.notEqual(sceneEl.behaviors.indexOf(component), -1);
      el.removeAttribute('look-controls');
      assert.equal(sceneEl.behaviors.indexOf(component), -1);
    });
  });

  suite('updateComponent', function () {
    test('initialize a component', function () {
      var el = this.el;
      assert.equal(el.components.material, undefined);
      el.updateComponent('material', {color: 'blue'});
      assert.equal(el.getAttribute('material').color, 'blue');
    });

    test('update an existing component', function () {
      var el = this.el;
      var component = new components.material.Component(el, {color: 'red'});
      el.components.material = component;
      assert.equal(el.getAttribute('material').color, 'red');
      el.updateComponent('material', {color: 'blue'});
      assert.equal(component, el.components.material);
      assert.equal(el.getAttribute('material').color, 'blue');
    });

    test('remove a component', function () {
      var el = this.el;
      el.components.material = new components.material.Component(el, {color: 'red'});
      assert.equal(el.getAttribute('material').color, 'red');
      el.updateComponent('material', null);
      assert.equal(el.components.material, undefined);
    });
  });

  suite('updateComponentAttribute', function () {
    test('initialize a component', function () {
      var el = this.el;
      assert.equal(el.components.material, undefined);
      el.updateComponentProperty('material', 'color', 'blue');
      assert.equal(el.getAttribute('material').color, 'blue');
    });

    test('update a property of an existing component', function () {
      var el = this.el;
      var component = new components.material.Component(el, {color: 'red'});
      el.components.material = component;
      assert.equal(el.getAttribute('material').color, 'red');
      el.updateComponentProperty('material', 'color', 'blue');
      assert.equal(component, el.components.material);
      assert.equal(el.getAttribute('material').color, 'blue');
    });
  });

  suite('applyMixin', function () {
    test('combines mixin and element components with a dynamic schema', function () {
      var el = this.el;
      var mixinId = 'material';
      mixinFactory(mixinId, {material: 'shader: flat'});
      el.setAttribute('mixin', mixinId);
      el.setAttribute('material', 'color: red');
      assert.shallowDeepEqual(el.getAttribute('material'), {shader: 'flat', color: 'red'});
    });

    test('merges component properties from mixin', function (done) {
      var el = this.el;
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
      var el = this.el;
      var mixinId = 'position';
      mixinFactory(mixinId, {position: '1 2 3'});
      el.setAttribute('mixin', mixinId);
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
    });

    test('does not override defined property', function () {
      var el = this.el;
      el.setAttribute('material', {color: 'red'});
      mixinFactory('blue', {material: 'color: blue'});
      el.setAttribute('mixin', 'blue');
      assert.shallowDeepEqual(el.getAttribute('material').color, 'red');
    });

    test('applies multiple components from mixin', function () {
      var el = this.el;
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
      var el = this.el;
      mixinFactory('material', {material: 'shader: flat'});
      mixinFactory('position', {position: '1 2 3'});
      mixinFactory('rotation', {rotation: '10 20 30'});
      el.setAttribute('mixin', '  material\t\nposition \t  rotation\n  ');
      el.setAttribute('material', 'color: red');
      assert.shallowDeepEqual(el.getAttribute('material'), {shader: 'flat', color: 'red'});
      assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(el.getAttribute('rotation'), {x: 10, y: 20, z: 30});
      assert.equal(el.mixinEls.length, 3);
    });

    test('clear mixin', function () {
      var el = this.el;
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

  teardown(function () {
    components.test = undefined;
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

  test('calls pause on entity pause', function () {
    var el = this.el;
    var TestComponent = this.TestComponent.prototype;

    this.sinon.spy(TestComponent, 'pause');
    el.play();
    el.setAttribute('test', '');
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

  test('removes tick from scene behaviors on entity pause', function (done) {
    var el = this.el;
    var testComponentInstance;
    el.sceneEl.addEventListener('loaded', function () {
      el.setAttribute('test', '');
      testComponentInstance = el.components.test;
      assert.notEqual(el.sceneEl.behaviors.indexOf(testComponentInstance), -1);
      el.pause();
      assert.equal(el.sceneEl.behaviors.indexOf(testComponentInstance), -1);
      done();
    });
  });

  test('adds tick to scene behaviors on entity play', function () {
    var el = this.el;
    var testComponentInstance;
    el.sceneEl.addEventListener('loaded', function () {
      el.setAttribute('test', '');
      testComponentInstance = el.components.test;
      el.sceneEl.behaviors = [];
      assert.equal(el.sceneEl.behaviors.indexOf(testComponentInstance), -1);
      el.play();
      assert.equal(el.sceneEl.behaviors.indexOf(testComponentInstance), -1);
    });
  });
});

suite('a-entity component dependency management', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
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

    el.addEventListener('loaded', function () { done(); });
  });

  teardown(function () {
    components.root = undefined;
    components.codependency = undefined;
    components.dependency = undefined;
    components['nested-dependency'] = undefined;
  });

  test('initializes dependency components', function () {
    var el = this.el;
    el.setAttribute('root', '');
    assert.ok('root' in el.components);
    assert.ok('dependency' in el.components);
    assert.ok('codependency' in el.components);
    assert.ok('nested-dependency' in el.components);
  });

  test('only initializes each component once', function () {
    this.el.setAttribute('root', '');
    assert.equal(this.rootInit.callCount, 1);
    assert.equal(this.dependencyInit.callCount, 1);
    assert.equal(this.codependencyInit.callCount, 1);
    assert.equal(this.nestedDependencyInit.callCount, 1);
  });

  test('initializes dependency components when not yet loaded', function () {
    var el = document.createElement('a-entity');
    el.setAttribute('root', '');
    assert.ok('root' in el.components);
    assert.ok('dependency' in el.components);
    assert.ok('codependency' in el.components);
    assert.ok('nested-dependency' in el.components);
  });

  test('initializes components (calling .init()) in the correct order', function (done) {
    var el = helpers.entityFactory();
    var self = this;
    el.addEventListener('loaded', function () {
      sinon.assert.callOrder(
        self.nestedDependencyInit,
        self.dependencyInit,
        self.codependencyInit,
        self.rootInit
      );
      done();
    });
    el.setAttribute('root', '');
  });

  test('initializes components (calling .init()) in the correct order via HTML', function (done) {
    var parentEl = helpers.entityFactory();
    var self = this;
    parentEl.addEventListener('child-attached', function (evt) {
      var el = evt.detail.el;
      el.addEventListener('loaded', function () {
        sinon.assert.callOrder(
          self.nestedDependencyInit,
          self.dependencyInit,
          self.codependencyInit,
          self.rootInit
        );
        done();
      });
    });
    parentEl.innerHTML = '<a-entity root></a-entity>';
  });
});
