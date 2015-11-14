/* global assert, process, setup, sinon, suite, test */
var VRObject = require('core/vr-object');
var THREE = require('vr-markup').THREE;
var entityFactory = require('../helpers.js').entityFactory;

suite('vr-object', function () {
  'use strict';

  test('adds itself to parent when attached', function (done) {
    var el = document.createElement('vr-object');
    var parentEl = entityFactory();
    var sinon = this.sinon;

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
      this.sinon.spy(VRObject.prototype, 'load');
      el.addEventListener('loaded', function () {
        sinon.assert.called(VRObject.prototype.load);
        done();
      });
    });
  });

  /**
   * Tests full component set + get flow on one of the most basic components.
   */
  suite('attributeChangedCallback', function () {
    test('can update component data', function () {
      var el = entityFactory();
      var position;

      el.addEventListener('loaded', function () {
        el.setAttribute('position', '10 20 30');
        position = el.getAttribute('position');
        assert.deepEqual(position, {x: 10, y: 20, z: 30});

        el.setAttribute('position', {x: 30, y: 20, z: 10});
        position = el.getAttribute('position');
        assert.deepEqual(position, {x: 30, y: 20, z: 10});
      });
    });
  });

  suite('detachedCallback', function () {
    test('removes itself from object parent', function (done) {
      var parentEl = entityFactory();
      var el = document.createElement('vr-object');

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
    test('returns full component data', function () {
      var componentData;
      var el = entityFactory();
      el.addEventListener('loaded', function () {
        el.setAttribute('geometry', 'primitive: box; width: 5');
        componentData = el.getAttribute('geometry');
        assert.ok('height' in componentData);
      });
    });
  });

  suite('getComputedAttribute', function () {
    test('returns parsed component data', function () {
      var componentData;
      var el = entityFactory();
      el.addEventListener('loaded', function () {
        el.setAttribute('geometry', 'primitive: box; width: 5');
        componentData = el.getComputedAttribute('geometry');
        assert.deepEqual(componentData, { primitive: 'box', width: 5 });
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
