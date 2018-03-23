/* global AFRAME, assert, process, suite, teardown, test, setup, sinon, HTMLElement, HTMLHeadElement */
var Component = require('core/component');
var components = require('index').components;

var helpers = require('../helpers');
var registerComponent = require('index').registerComponent;

var CloneComponent = {
  init: function () {
    var object3D = this.el.object3D;
    var clone = object3D.clone();
    clone.uuid = 'Bubble Fett';
    object3D.add(clone);
  }
};
var entityFactory = helpers.entityFactory;

suite('Component', function () {
  suite('standard components', function () {
    test('are registered', function () {
      assert.ok('geometry' in components);
      assert.ok('material' in components);
      assert.ok('light' in components);
      assert.ok('position' in components);
      assert.ok('rotation' in components);
      assert.ok('scale' in components);
    });
  });

  suite('buildData', function () {
    setup(function () {
      components.dummy = undefined;
    });

    test('uses default values', function () {
      registerComponent('dummy', {
        schema: {
          color: {default: 'blue'},
          size: {default: 5}
        }
      });
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', '');
      var data = el.components.dummy.buildData({}, null);
      assert.equal(data.color, 'blue');
      assert.equal(data.size, 5);
    });

    test('uses default values for single-property schema', function () {
      registerComponent('dummy', {
        schema: {default: 'blue'}
      });
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', '');
      var data = el.components.dummy.buildData(undefined, null);
      assert.equal(data, 'blue');
    });

    test('preserves type of default values', function () {
      registerComponent('dummy', {
        schema: {
          list: {default: [1, 2, 3, 4]},
          none: {default: null},
          string: {default: ''}
        }
      });
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', '');
      var data = el.components.dummy.buildData(undefined, null);
      assert.shallowDeepEqual(data.list, [1, 2, 3, 4]);
      assert.equal(data.none, null);
      assert.equal(data.string, '');
    });

    test('uses mixin values', function () {
      var data;
      registerComponent('dummy', {
        schema: {
          color: {default: 'red'},
          size: {default: 5}
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('dummy', 'color: blue; size: 10');
      el.mixinEls = [mixinEl];
      el.setAttribute('dummy', '');
      data = el.components.dummy.buildData({}, null);
      assert.equal(data.color, 'blue');
      assert.equal(data.size, 10);
    });

    test('uses mixin values for single-property schema', function () {
      var data;
      registerComponent('dummy', {
        schema: {
          default: 'red'
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('dummy', 'blue');
      el.mixinEls = [mixinEl];
      el.setAttribute('dummy', '');
      data = el.components.dummy.buildData(undefined, null);
      assert.equal(data, 'blue');
    });

    test('uses defined values', function () {
      var data;
      registerComponent('dummy', {
        schema: {
          color: {default: 'red'},
          size: {default: 5}
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');

      mixinEl.setAttribute('dummy', 'color: blue; size: 10');
      el.mixinEls = [mixinEl];
      el.setAttribute('dummy', '');
      data = el.components.dummy.buildData({color: 'green', size: 20}, 'color: green; size: 20');
      assert.equal(data.color, 'green');
      assert.equal(data.size, 20);
    });

    test('uses defined values for single-property schema', function () {
      var data;
      registerComponent('dummy', {
        schema: {default: 'red'}
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('dummy', 'blue');
      el.mixinEls = [mixinEl];
      el.setAttribute('dummy', '');
      data = el.components.dummy.buildData('green', 'green');
      assert.equal(data, 'green');
    });

    test('returns default for single-prop schema when attr is empty string', function () {
      var data;
      registerComponent('dummy', {
        schema: {default: 'red'}
      });
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', '');
      data = el.components.dummy.buildData('red');
      assert.equal(data, 'red');
    });

    test('multiple vec3 properties do not share same default value object', function (done) {
      var data;
      var el = entityFactory();
      var TestComponent = registerComponent('dummy', {
        schema: {
          direction: {type: 'vec3'},
          position: {type: 'vec3'}
        }
      });
      el.addEventListener('loaded', function () {
        el.setAttribute('dummy', '');
        data = el.getAttribute('dummy');
        assert.shallowDeepEqual(data.direction,
                                TestComponent.prototype.schema.direction.default);
        assert.shallowDeepEqual(data.position,
                                TestComponent.prototype.schema.position.default);
        assert.notEqual(data.direction, data.position);
        done();
      });
    });

    test('boolean properties are preserved when updating the component data', function () {
      var data;
      registerComponent('dummy', {
        schema: {
          depthTest: {default: true},
          color: {default: 'red'}
        }
      });
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', {color: 'blue', depthTest: false});
      data = el.components.dummy.buildData({color: 'red'});
      assert.equal(data.depthTest, false);
      assert.equal(data.color, 'red');
    });

    test('returns data for single-prop if default is null', function () {
      var el = document.createElement('a-entity');
      registerComponent('test', {
        schema: {default: null}
      });
      el.setAttribute('test', '');
      assert.equal(el.components.test.buildData(), null);
      assert.equal(el.components.test.buildData(null), null);
      assert.equal(el.components.test.buildData('foo'), 'foo');
    });

    test('returns data for multi-prop if default is null with previousData', function () {
      var el = document.createElement('a-entity');
      registerComponent('test', {
        schema: {
          foo: {default: null}
        }
      });
      el.setAttribute('test', '');
      el.components.test.attrValue = {foo: null};
      assert.equal(el.components.test.buildData().foo, null);
      assert.equal(el.components.test.buildData({foo: null}).foo, null);
      assert.equal(el.components.test.buildData({foo: 'foo'}).foo, 'foo');
    });

    test('clones array property type', function () {
      var array = ['a'];
      var data;
      var el;
      registerComponent('test', {schema: {default: array}});
      el = document.createElement('a-entity');
      el.setAttribute('test', '');
      data = el.components.test.buildData();
      assert.equal(data[0], 'a');
      assert.notEqual(data, array);
    });

    test('does not override set data with mixin', function (done) {
      var el;
      var mixinEl;

      el = helpers.entityFactory();

      registerComponent('dummy', {
        schema: {
          color: {default: 'blue'},
          size: {default: 5}
        }
      });

      mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('id', 'mixindummy');
      mixinEl.setAttribute('dummy', 'size: 1');

      el.addEventListener('loaded', () => {
        el.sceneEl.appendChild(mixinEl);
        el.setAttribute('mixin', 'mixindummy');
        el.setAttribute('dummy', 'size', 20);
        el.setAttribute('dummy', 'color', 'red');
        assert.equal(el.getAttribute('dummy').color, 'red');
        assert.equal(el.getAttribute('dummy').size, 20);
        done();
      });
    });
  });

  suite('updateProperties', function () {
    var el;

    setup(function () {
      el = entityFactory();
      components.dummy = undefined;
    });

    test('emits componentchanged for multi-prop', function (done) {
      el.setAttribute('material', 'color: red');
      el.addEventListener('componentchanged', function (evt) {
        if (evt.detail.name !== 'material') { return; }
        assert.equal(evt.detail.name, 'material');
        assert.equal(el.getAttribute('material').color, 'blue');
        assert.ok('id' in evt.detail);
        done();
      });
      setTimeout(() => {
        el.setAttribute('material', 'color: blue');
      });
    });

    test('emits componentchanged for single-prop', function (done) {
      el.setAttribute('position', {x: 0, y: 0, z: 0});
      el.addEventListener('componentchanged', function (evt) {
        if (evt.detail.name !== 'position') { return; }
        assert.shallowDeepEqual(el.getAttribute('position'), {x: 1, y: 2, z: 3});
        assert.equal(evt.detail.name, 'position');
        assert.ok('id' in evt.detail);
        done();
      });
      setTimeout(() => {
        el.setAttribute('position', {x: 1, y: 2, z: 3});
      });
    });

    test('does not emit componentchanged for multi-prop if not changed', function (done) {
      el.addEventListener('componentinitialized', function (evt) {
        if (evt.detail.name !== 'material') { return; }

        el.addEventListener('componentchanged', function (evt) {
          if (evt.detail.name !== 'material') { return; }
          // Should not reach here.
          assert.equal(true, false, 'Component should not have emitted changed.');
        });

        // Update.
        el.setAttribute('material', 'color', 'red');

        // Have `done()` race with the failing assertion in the event handler.
        setTimeout(() => {
          done();
        }, 100);
      });
      // Initialization.
      el.setAttribute('material', 'color', 'red');
    });

    test('does not update for multi-prop if not changed', function (done) {
      var spy = this.sinon.spy();

      AFRAME.registerComponent('test', {
        schema: {
          foo: {type: 'string'},
          bar: {type: 'string'}
        },

        update: function () {
          spy();
        }
      });

      el.addEventListener('loaded', () => {
        el.setAttribute('test', {foo: 'foo', bar: 'bar'});
        el.setAttribute('test', {foo: 'foo', bar: 'bar'});
        el.setAttribute('test', {foo: 'foo', bar: 'bar'});
        assert.equal(spy.getCalls().length, 1);
        done();
      });
    });

    test('does not update for multi-prop if not changed using same object', function (done) {
      var data = {foo: 'foo', bar: 'bar'};
      var spy = this.sinon.spy();

      AFRAME.registerComponent('test', {
        schema: {
          foo: {type: 'string'},
          bar: {type: 'string'}
        },

        update: function () {
          spy();
        }
      });

      el.addEventListener('loaded', () => {
        el.setAttribute('test', data);
        el.setAttribute('test', data);
        el.setAttribute('test', data);
        assert.equal(spy.getCalls().length, 1);
        done();
      });
    });

    test('does not emit componentchanged for single-prop if not changed', function (done) {
      el.addEventListener('componentinitialized', function (evt) {
        if (evt.detail.name !== 'position') { return; }

        el.addEventListener('componentchanged', function (evt) {
          if (evt.detail.name !== 'position') { return; }
          // Should not reach here.
          assert.equal(true, false, 'Component should not have emitted changed.');
        });

        // Update.
        el.setAttribute('position', {x: 1, y: 2, z: 3});

        // Have `done()` race with the failing assertion in the event handler.
        setTimeout(() => {
          done();
        }, 100);
      });
      // Initialization.
      el.setAttribute('position', {x: 1, y: 2, z: 3});
    });

    test('does not emit componentchanged for value if not changed', function (done) {
      el.addEventListener('componentinitialized', function (evt) {
        if (evt.detail.name !== 'visible') { return; }

        el.addEventListener('componentchanged', function (evt) {
          if (evt.detail.name !== 'visible') { return; }
          // Should not reach here.
          assert.equal(true, false, 'Component should not have emitted changed.');
        });

        // Update.
        el.setAttribute('visible', false);

        // Have `done()` race with the failing assertion in the event handler.
        setTimeout(() => {
          done();
        }, 100);
      });
      // Initialization.
      el.setAttribute('visible', false);
    });

    test('emits componentinitialized', function (done) {
      el.addEventListener('componentinitialized', function (evt) {
        if (evt.detail.name !== 'material') { return; }
        assert.ok('id' in evt.detail);
        assert.equal(evt.detail.name, 'material');
        done();
      });
      el.setAttribute('material', '');
    });

    test('a selector property default is not cloned into data', function () {
      registerComponent('dummy', {
        schema: {type: 'selector', default: document.body}
      });
      var el = document.createElement('a-entity');
      el.hasLoaded = true;
      el.setAttribute('dummy', 'head');
      el.components.dummy.updateProperties('');
      assert.equal(el.components.dummy.data, el.components.dummy.schema.default);
    });

    test('clones plain object schema default into data', function () {
      registerComponent('dummy', {
        schema: {type: 'vec3', default: {x: 1, y: 1, z: 1}}
      });
      var el = document.createElement('a-entity');
      el.hasLoaded = true;
      el.setAttribute('dummy', '2 2 2');
      el.components.dummy.updateProperties('');
      assert.notEqual(el.components.dummy.data, el.components.dummy.schema.default);
      assert.deepEqual(el.components.dummy.data, {x: 1, y: 1, z: 1});
    });

    test('does not clone properties from attrValue into data that are not plain objects', function () {
      var attrValue;
      var data;
      var el;

      registerComponent('dummy', {
        schema: {
          color: {default: 'blue'},
          direction: {type: 'vec3'},
          el: {type: 'selector', default: 'body'}
        }
      });
      el = document.createElement('a-entity');
      el.hasLoaded = true;
      el.setAttribute('dummy', '');
      assert.notOk(el.components.dummy.attrValue.el);

      // Direction property preserved across updateProperties calls but cloned into a different
      // object.
      el.components.dummy.updateProperties({
        color: 'green',
        direction: {x: 1, y: 1, z: 1},
        el: document.head
      });
      el.components.dummy.updateProperties({
        color: 'red',
        el: document.head
      });
      data = el.getAttribute('dummy');
      attrValue = el.components.dummy.attrValue;
      assert.notEqual(data, attrValue);
      assert.equal(data.color, attrValue.color);
      // HTMLElement not cloned in attrValue, reference is shared instead.
      assert.equal(data.el, attrValue.el);
      assert.equal(data.el.constructor, HTMLHeadElement);
      assert.deepEqual(data.direction, {x: 1, y: 1, z: 1});
      assert.deepEqual(attrValue.direction, {x: 1, y: 1, z: 1});

      el.components.dummy.updateProperties({
        color: 'red',
        direction: {x: 1, y: 1, z: 1}
      });
      data = el.getAttribute('dummy');
      // HTMLElement not cloned in attrValue, reference is shared instead.
      assert.equal(data.el.constructor, HTMLHeadElement);
      assert.equal(data.el, el.components.dummy.attrValue.el);
    });
  });

  suite('resetProperty', function () {
    var el;

    setup(function (done) {
      el = entityFactory();
      el.addEventListener('loaded', () => { done(); });
    });

    test('resets property to default value', function () {
      AFRAME.registerComponent('test', {
        schema: {
          bar: {default: 5},
          foo: {default: 5}
        }
      });
      el.setAttribute('test', {bar: 10, foo: 10});
      el.components.test.resetProperty('bar');
      assert.equal(el.getAttribute('test').bar, 5);
      assert.equal(el.getAttribute('test').foo, 10);
    });

    test('resets property to default value for single-prop', function () {
      AFRAME.registerComponent('test', {
        schema: {default: 5}
      });
      el.setAttribute('test', 10);
      el.components.test.resetProperty();
      assert.equal(el.getAttribute('test'), 5);
    });
  });

  suite('third-party components', function () {
    var el;
    setup(function () {
      el = entityFactory();
      delete components.clone;
    });

    test('can be registered', function () {
      assert.notOk('clone' in components);
      registerComponent('clone', CloneComponent);
      assert.ok('clone' in components);
    });

    test('can change behavior of entity', function (done) {
      registerComponent('clone', CloneComponent);

      el.addEventListener('loaded', function () {
        assert.notOk('clone' in el.components);
        assert.notOk(el.object3D.children.length);
        el.setAttribute('clone', '');
        assert.ok('clone' in el.components);
        assert.equal(el.object3D.children[0].uuid, 'Bubble Fett');
        done();
      });
    });

    test('cannot be registered if it uses the character __ in the name', function () {
      assert.notOk('my__component' in components);
      assert.throws(function register () {
        registerComponent('my__component', CloneComponent);
      }, Error);
      assert.notOk('my__component' in components);
    });
  });

  suite('schema', function () {
    test('can be accessed', function () {
      assert.ok(components.position.schema);
    });
  });

  suite('parse', function () {
    setup(function () {
      components.dummy = undefined;
    });

    test('parses single value component', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {default: '0 0 1', type: 'vec3'}
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      var componentObj = component.parse('1 2 3');
      assert.deepEqual(componentObj, {x: 1, y: 2, z: 3});
    });

    test('parses component properties vec3', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {
          position: {type: 'vec3', default: '0 0 1'}
        }
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      var componentObj = component.parse({position: '0 1 0'});
      assert.deepEqual(componentObj.position, {x: 0, y: 1, z: 0});
    });
  });

  suite('parseAttrValueForCache', function () {
    setup(function () {
      components.dummy = undefined;
    });

    test('parses single value component', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {default: '0 0 1', type: 'vec3'}
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      var componentObj = component.parseAttrValueForCache('1 2 3');
      assert.deepEqual(componentObj, {x: 1, y: 2, z: 3});
    });

    test('parses component using the style parser for a complex schema', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {
          position: {type: 'vec3', default: '0 0 1'},
          color: {default: 'red'}
        }
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      var componentObj = component.parseAttrValueForCache({position: '0 1 0', color: 'red'});
      assert.deepEqual(componentObj, {position: '0 1 0', color: 'red'});
    });

    test('does not parse properties that parse to another string', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {
          url: {type: 'src', default: ''}
        }
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      var componentObj = component.parseAttrValueForCache({url: 'url(www.mozilla.com)'});
      assert.equal(componentObj.url, 'url(www.mozilla.com)');
    });
  });

  suite('stringify', function () {
    setup(function () {
      components.dummy = undefined;
    });

    test('stringifies single value component', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {default: '0 0 1', type: 'vec3'}
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      var componentString = component.stringify({x: 1, y: 2, z: 3});
      assert.deepEqual(componentString, '1 2 3');
    });

    test('stringifies component property vec3', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {
          position: {type: 'vec3', default: '0 0 1'}
        }
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      var componentObj = {position: {x: 1, y: 2, z: 3}};
      var componentString = component.stringify(componentObj);
      assert.deepEqual(componentString, 'position:1 2 3');
    });
  });

  suite('extendSchema', function () {
    setup(function () {
      components.dummy = undefined;
    });

    test('extends the schema', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}}
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      component.extendSchema({size: {default: 5}});
      assert.ok(component.schema.size);
      assert.ok(component.schema.color);
    });
  });

  suite('updateProperties', function () {
    setup(function (done) {
      components.dummy = undefined;
      var el = this.el = entityFactory();
      if (el.hasLoaded) { done(); }
      el.addEventListener('loaded', function () { done(); });
    });

    test('updates the schema of a component', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}},
        updateSchema: function (data) {
          this.extendSchema({energy: {default: 100}});
        }
      });
      var component = new TestComponent(this.el);
      component.updateProperties(null);
      assert.equal(component.schema.color.default, 'red');
      assert.equal(component.schema.energy.default, 100);
      assert.equal(component.data.color, 'red');
    });

    test('updates the properties with the new value', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}}
      });
      var component = new TestComponent(this.el);
      component.updateProperties(null);
      assert.equal(component.data.color, 'red');
    });

    test('updates the properties with a null value', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}}
      });
      var component = new TestComponent(this.el);
      component.updateProperties({color: 'blue'});
      assert.equal(component.data.color, 'blue');
    });
  });

  suite('init', function () {
    setup(function (done) {
      components.dummy = undefined;
      var el = this.el = entityFactory();
      if (el.hasLoaded) { done(); }
      el.addEventListener('loaded', function () { done(); });
    });

    test('init is only called once if the init routine sets the component', function () {
      var initCanaryStub = sinon.stub();
      var el = this.el;
      registerComponent('dummy', {
        schema: {color: {default: 'red'}},
        init: function () {
          this.initCanary();
          this.el.setAttribute('dummy', {color: 'green'});
        },
        initCanary: initCanaryStub
      });
      el.setAttribute('dummy', {color: 'blue'});
      assert.equal(el.getAttribute('dummy').color, 'green');
      sinon.assert.calledOnce(initCanaryStub);
    });
  });

  suite('update', function () {
    setup(function (done) {
      components.dummy = undefined;
      var el = this.el = entityFactory();
      if (el.hasLoaded) { done(); }
      el.addEventListener('loaded', function () { done(); });
    });

    test('not called if component data does not change', function () {
      var updateStub = sinon.stub();
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}}
      });
      var component = new TestComponent(this.el);
      component.update = updateStub;
      component.updateProperties({color: 'blue'});
      component.updateProperties({color: 'blue'});
      assert.ok(updateStub.calledOnce);
    });

    test('supports array properties', function () {
      var updateStub = sinon.stub();
      var TestComponent = registerComponent('dummy', {
        schema: {list: {default: ['a']}}
      });
      var component = new TestComponent(this.el);
      component.update = updateStub;
      component.updateProperties({list: ['b']});
      component.updateProperties({list: ['b']});
      sinon.assert.calledOnce(updateStub);
    });

    test('emit componentchanged when update calls setAttribute', function (done) {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}},
        update: function () { this.el.setAttribute('dummy', 'color', 'blue'); }
      });
      this.el.addEventListener('componentchanged', evt => {
        assert.equal(evt.detail.name, 'dummy');
        assert.equal(this.el.getAttribute('dummy').color, 'blue');
        done();
      });
      var component = new TestComponent(this.el);
      assert.equal(component.data.color, 'blue');
    });

    test('oldData is empty object on the first call when a single property component with an object as default initializes', function () {
      var updateStub = sinon.stub();
      registerComponent('dummy', {
        schema: {type: 'vec3'},
        update: updateStub
      });
      this.el.setAttribute('dummy', '');
      sinon.assert.calledOnce(updateStub);
      // old Data passed to the update method
      assert.deepEqual(updateStub.getCalls()[0].args[0], {});
    });

    test('oldData is empty object on the first call when a multiple property component initializes', function () {
      var updateStub = sinon.stub();
      registerComponent('dummy', {
        schema: {
          color: {default: 'red'},
          size: {default: 0}
        },
        update: updateStub
      });
      this.el.setAttribute('dummy', '');
      sinon.assert.calledOnce(updateStub);
      // old Data passed to the update method
      assert.deepEqual(updateStub.getCalls()[0].args[0], {});
    });

    test('oldData is undefined on the first call when a single property component initializes', function () {
      var updateStub = sinon.stub();
      registerComponent('dummy', {
        schema: {default: 0},
        update: updateStub
      });
      this.el.setAttribute('dummy', '');
      sinon.assert.calledOnce(updateStub);
      // old Data passed to the update method
      assert.equal(updateStub.getCalls()[0].args[0], undefined);
    });

    test('called when modifying component with value returned from getAttribute', function () {
      var el = this.el;
      var direction;
      var updateStub = sinon.stub();
      registerComponent('dummy', {
        schema: {type: 'vec3', default: {x: 1, y: 1, z: 1}},
        update: updateStub
      });
      el.setAttribute('dummy', '');
      direction = el.getAttribute('dummy');
      assert.deepEqual(direction, {x: 1, y: 1, z: 1});
      direction.x += 1;
      direction.y += 1;
      direction.z += 1;
      el.setAttribute('dummy', direction);
      sinon.assert.calledTwice(updateStub);
      // old Data passed to the update method
      assert.deepEqual(updateStub.getCalls()[0].args[0], {});
      assert.deepEqual(updateStub.getCalls()[1].args[0], {x: 1, y: 1, z: 1});
      assert.deepEqual(el.components.dummy.data, {x: 2, y: 2, z: 2});
    });

    test('oldData and data is properly passed on recursive calls to setAttribute', function () {
      var el = this.el;
      registerComponent('dummy', {
        schema: {
          color: {default: 'red'},
          size: {default: 0}
        },
        update: function (oldData) {
          if (this.data.color === 'red') {
            this.el.setAttribute('dummy', 'color', 'blue');
          }
          if (oldData.color === 'red') {
            this.el.setAttribute('dummy', 'color', 'green');
          }
        }
      });
      el.setAttribute('dummy', 'color: red');
      assert.equal(el.getAttribute('dummy').color, 'green');
    });
  });

  suite('flushToDOM', function () {
    setup(function () {
      components.dummy = undefined;
    });

    test('updates component DOM attribute', function () {
      registerComponent('dummy', {
        schema: {color: {default: 'red'}}
      });
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', {color: 'blue'});
      assert.equal(HTMLElement.prototype.getAttribute.call(el, 'dummy'), '');
      el.components.dummy.flushToDOM();
      assert.equal(HTMLElement.prototype.getAttribute.call(el, 'dummy'), 'color:blue');
    });

    test('init and update are not called for a not loaded entity', function () {
      var updateStub = sinon.stub();
      var initStub = sinon.stub();
      var el = document.createElement('a-entity');
      registerComponent('dummy', {
        schema: {color: {default: 'red'}},
        init: initStub,
        update: updateStub
      });
      assert.notOk(el.hasLoaded);
      el.setAttribute('dummy', {color: 'blue'});
      assert.equal(HTMLElement.prototype.getAttribute.call(el, 'dummy'), '');
      el.components.dummy.flushToDOM();
      sinon.assert.notCalled(initStub);
      sinon.assert.notCalled(updateStub);
      assert.equal(HTMLElement.prototype.getAttribute.call(el, 'dummy'), 'color:blue');
    });
  });

  suite('play', function () {
    setup(function () {
      components.dummy = undefined;
      var playStub = this.playStub = sinon.stub();
      registerComponent('dummy', {play: playStub});
    });

    test('not called if entity is not playing', function () {
      var el = document.createElement('a-entity');
      var dummyComponent;
      el.isPlaying = false;
      el.setAttribute('dummy', '');
      dummyComponent = el.components.dummy;
      dummyComponent.initialized = true;
      dummyComponent.play();
      sinon.assert.notCalled(this.playStub);
    });

    test('not called if component is not initialized', function () {
      var el = document.createElement('a-entity');
      el.isPlaying = true;
      el.setAttribute('dummy', '');
      el.components.dummy.play();
      sinon.assert.notCalled(this.playStub);
    });

    test('not called if component is already playing', function () {
      var el = document.createElement('a-entity');
      var dummyComponent;
      el.isPlaying = true;
      el.setAttribute('dummy', '');
      dummyComponent = el.components.dummy;
      dummyComponent.initialized = true;
      dummyComponent.play();
      dummyComponent.play();
      sinon.assert.calledOnce(this.playStub);
    });
  });

  suite('pause', function () {
    setup(function () {
      components.dummy = undefined;
      var pauseStub = this.pauseStub = sinon.stub();
      registerComponent('dummy', {
        schema: {color: {default: 'red'}},
        pause: pauseStub
      });
    });

    test('not called if component is not playing', function () {
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', '');
      el.components.dummy.pause();
      sinon.assert.notCalled(this.pauseStub);
    });

    test('called if component is playing', function () {
      var el = document.createElement('a-entity');
      var dummyComponent;
      el.setAttribute('dummy', '');
      el.isPlaying = true;
      dummyComponent = el.components.dummy;
      dummyComponent.initialized = true;
      dummyComponent.isPlaying = true;
      dummyComponent.pause();
      sinon.assert.called(this.pauseStub);
    });

    test('not called if component is already paused', function () {
      var el = document.createElement('a-entity');
      var dummyComponent;
      el.setAttribute('dummy', '');
      dummyComponent = el.components.dummy;
      dummyComponent.isPlaying = true;
      dummyComponent.pause();
      dummyComponent.pause();
      sinon.assert.calledOnce(this.pauseStub);
    });
  });

  test('applies default array property types with no defined value', function (done) {
    var el;
    registerComponent('test', {
      schema: {default: ['foo']},

      update: function () {
        assert.equal(this.data[0], 'foo');
        done();
      }
    });
    el = entityFactory();
    el.setAttribute('test', '');
  });
});

suite('registerComponent warnings', function () {
  var sceneEl;
  var script;

  setup(function (done) {
    var el = entityFactory();
    el.addEventListener('loaded', function () {
      sceneEl = el.sceneEl;
      script = document.createElement('script');
      script.innerHTML = `AFRAME.registerComponent('testorder', {});`;
      done();
    });
  });

  teardown(function () {
    delete AFRAME.components.testorder;
    delete Component.registrationOrderWarnings.testorder;
    if (script.parentNode) { script.parentNode.removeChild(script); }
  });

  test('does not throw warning if component registered in head', function (done) {
    assert.notOk(Component.registrationOrderWarnings.testorder, 'waht');
    document.head.appendChild(script);
    setTimeout(() => {
      assert.notOk(Component.registrationOrderWarnings.testorder);
      done();
    });
  });

  test('does not throw warning if component registered before scene', function (done) {
    assert.notOk(Component.registrationOrderWarnings.testorder, 'foo');
    document.body.insertBefore(script, sceneEl);
    setTimeout(() => {
      assert.notOk(Component.registrationOrderWarnings.testorder);
      done();
    });
  });

  test('does not throw warning if component registered after scene loaded', function (done) {
    assert.notOk(Component.registrationOrderWarnings.testorder, 'blah');
    sceneEl.addEventListener('loaded', () => {
      document.body.appendChild(script);
      setTimeout(() => {
        assert.notOk(Component.registrationOrderWarnings.testorder);
        done();
      });
    });
  });

  test('throws warning if component registered after scene', function (done) {
    assert.notOk(Component.registrationOrderWarnings.testorder);
    document.body.appendChild(script);
    setTimeout(() => {
      assert.ok(Component.registrationOrderWarnings.testorder);
      done();
    });
  });

  test('throws warning if component registered within scene', function (done) {
    assert.notOk(Component.registrationOrderWarnings.testorder);
    sceneEl.appendChild(script);
    setTimeout(() => {
      assert.ok(Component.registrationOrderWarnings.testorder);
      done();
    });
  });
});
