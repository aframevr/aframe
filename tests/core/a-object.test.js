/* global assert, process, setup, sinon, suite, test */
var AObject = require('core/a-object');
var THREE = require('aframe-core').THREE;
var helpers = require('../helpers');

var entityFactory = helpers.entityFactory;
var mixinFactory = helpers.mixinFactory;

suite('a-object', function () {
  'use strict';

  test('adds itself to parent when attached', function (done) {
    var el = document.createElement('a-object');
    var parentEl = entityFactory();

    el.object3D = new THREE.Mesh();
    parentEl.addEventListener('loaded', function () {
      parentEl.appendChild(el);
      el.addEventListener('loaded', function () {
        assert.equal(parentEl.object3D.children[0].uuid, el.object3D.uuid);
        done();
      });
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
      this.sinon.spy(AObject.prototype, 'load');
      el.addEventListener('loaded', function () {
        sinon.assert.called(AObject.prototype.load);
        done();
      });
    });
  });

  /**
   * Tests full component set + get flow on one of the most basic components.
   */
  suite('attributeChangedCallback', function () {
    setup(function (done) {
      var el = this.el = entityFactory();
      el.addEventListener('loaded', function () {
        done();
      });
    });

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
    test('removes itself from object parent', function (done) {
      var parentEl = entityFactory();
      var el = document.createElement('a-object');

      parentEl.addEventListener('loaded', function () {
        parentEl.appendChild(el);

        el.addEventListener('loaded', function () {
          parentEl.removeChild(el);
          process.nextTick(function () {
            assert.equal(parentEl.object3D.children.length, 0);
            done();
          });
        });
      });
    });

    test('removes itself from scene parent', function (done) {
      var el = entityFactory();
      var parentEl = el.parentNode;

      parentEl.appendChild(el);
      el.addEventListener('loaded', function () {
        parentEl.removeChild(el);
        process.nextTick(function () {
          assert.equal(parentEl.object3D.children.length, 0);
          done();
        });
      });
    });
  });

  suite('getAttribute', function () {
    test('returns parsed component data', function (done) {
      var componentData;
      var el = entityFactory();
      el.addEventListener('loaded', function () {
        el.setAttribute('geometry', 'primitive: box; width: 5');
        process.nextTick(function () {
          componentData = el.getAttribute('geometry');
          assert.equal(componentData.width, 5);
          assert.notOk('height' in componentData);
          done();
        });
      });
    });
  });

  suite('getComputedAttribute', function () {
    test('returns fully parsed component data', function (done) {
      var componentData;
      var el = entityFactory();
      el.addEventListener('loaded', function () {
        el.setAttribute('geometry', 'primitive: box; width: 5');
        process.nextTick(function () {
          componentData = el.getComputedAttribute('geometry');
          assert.equal(componentData.primitive, 'box');
          assert.equal(componentData.width, 5);
          assert.ok('height' in componentData);
          done();
        });
      });
    });
  });

  suite('setAttribute', function () {
    test('transforms object to string before setting on DOM', function () {
      var el = entityFactory();
      var positionObj = { x: 10, y: 20, z: 30 };
      el.setAttribute('position', positionObj);
      assert.ok(el.outerHTML.indexOf('position="10 20 30"') !== -1);
    });
  });
});
