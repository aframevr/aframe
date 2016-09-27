/* global assert, process, suite, test, setup, sinon, HTMLElement */
var buildData = require('core/component').buildData;
var components = require('index').components;
var helpers = require('../helpers');
var registerComponent = require('index').registerComponent;
var processSchema = require('core/schema').process;

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
      var schema = processSchema({
        color: {default: 'blue'},
        size: {default: 5}
      });
      var el = document.createElement('a-entity');
      var data = buildData(el, 'dummy', schema, {}, null);
      assert.equal(data.color, 'blue');
      assert.equal(data.size, 5);
    });

    test('uses default values for single-property schema', function () {
      var schema = processSchema({
        default: 'blue'
      });
      var el = document.createElement('a-entity');
      var data = buildData(el, 'dummy', schema, undefined, null);
      assert.equal(data, 'blue');
    });

    test('uses mixin values', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {
          color: {default: 'red'},
          size: {default: 5}
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');

      mixinEl.setAttribute('dummy', 'color: blue; size: 10');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, {}, null);
      assert.equal(data.color, 'blue');
      assert.equal(data.size, 10);
    });

    test('uses mixin values for single-property schema', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {
          default: 'red'
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('dummy', 'blue');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, undefined, null);
      assert.equal(data, 'blue');
    });

    test('uses defined values', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {
          color: {default: 'red'},
          size: {default: 5}
        }
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');

      mixinEl.setAttribute('dummy', 'color: blue; size: 10');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, {
        color: 'green', size: 20
      }, 'color: green; size: 20');
      assert.equal(data.color, 'green');
      assert.equal(data.size, 20);
    });

    test('uses defined values for single-property schema', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {default: 'red'}
      });
      var el = document.createElement('a-entity');
      var mixinEl = document.createElement('a-mixin');
      mixinEl.setAttribute('dummy', 'blue');
      el.mixinEls = [mixinEl];
      data = buildData(el, 'dummy', TestComponent.prototype.schema, 'green', 'green');
      assert.equal(data, 'green');
    });

    test('returns default value for a single-property schema ' +
         'when the attribute is empty string', function () {
      var data;
      var TestComponent = registerComponent('dummy', {
        schema: {default: 'red'}
      });
      var el = document.createElement('a-entity');
      el.setAttribute('dummy', '');
      data = buildData(el, 'dummy', TestComponent.prototype.schema, 'red');
      assert.equal(data, 'red');
    });
  });

  suite('third-party components', function () {
    setup(function () {
      delete components.clone;
    });

    test('can be registered', function () {
      assert.notOk('clone' in components);
      registerComponent('clone', CloneComponent);
      assert.ok('clone' in components);
    });

    test('can change behavior of entity', function (done) {
      var el = entityFactory();
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
    setup(function () {
      components.dummy = undefined;
    });

    test('updates the schema of a component', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}},
        updateSchema: function (data) {
          this.extendSchema({energy: {default: 100}});
        }
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      component.updateProperties(null);
      assert.equal(component.schema.color.default, 'red');
      assert.equal(component.schema.energy.default, 100);
      assert.equal(component.data.color, 'red');
    });

    test('updates the properties with the new value', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}}
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      component.updateProperties(null);
      assert.equal(component.data.color, 'red');
    });

    test('updates the properties with a null value', function () {
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}}
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      component.updateProperties({color: 'blue'});
      assert.equal(component.data.color, 'blue');
    });
  });

  suite('update', function () {
    setup(function () {
      components.dummy = undefined;
    });

    test('not called if component data does not change', function () {
      var updateStub = sinon.stub();
      var TestComponent = registerComponent('dummy', {
        schema: {color: {default: 'red'}},
        update: updateStub
      });
      var el = document.createElement('a-entity');
      var component = new TestComponent(el);
      component.updateProperties({color: 'blue'});
      component.updateProperties({color: 'blue'});
      assert.ok(updateStub.calledOnce);
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
});
