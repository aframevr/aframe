/* global assert, process, setup, sinon, suite, test */
var VRObject = require('core/vr-object');

suite('vr-object', function () {
  'use strict';
  /**
   * Helper method to create a scene, create an object, add object to scene,
   * add scene to document.
   *
   * @returns {object} A <vr-object> element.
   */
  function entityFactory () {
    var scene = document.createElement('vr-scene');
    var object = document.createElement('vr-object');
    scene.appendChild(object);
    document.body.appendChild(scene);
    return object;
  }

  suite('add', function () {
    setup(function () {
    });

    test('calls parent object3D.add when child is added', function (done) {
      var el = document.createElement('vr-object');
      var object3DMock;
      var parentEl = entityFactory();
      var sinon = this.sinon;

      el.object3D = {};
      parentEl.addEventListener('loaded', function () {
        // Mock object3D *after* entity has loaded.
        object3DMock = sinon.mock(parentEl.object3D);
        object3DMock.expects('add').once();
        parentEl.appendChild(el);
        // Add child to parent, wait for it to load and attempt to add its
        // object3D to the parent's object3D.
        el.addEventListener('loaded', function () {
          object3DMock.verify();
          done();
        });
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
    test('tells object parent to remove object3D', function (done) {
      var object3DMock;
      var parentEl = entityFactory();
      var el = document.createElement('vr-object');
      var sinon = this.sinon;

      parentEl.addEventListener('loaded', function () {
        object3DMock = sinon.mock(parentEl.object3D);
        object3DMock.expects('remove').once();
        parentEl.appendChild(el);

        el.addEventListener('loaded', function () {
          parentEl.removeChild(el);
          process.nextTick(function () {
            object3DMock.verify();
            done();
          });
        });
      });
    });

    test('tells scene parent to remove object3D', function (done) {
      var object3DMock;
      var el = entityFactory();
      var parentEl = el.parentNode;
      var sinon = this.sinon;

      parentEl.appendChild(el);
      el.addEventListener('loaded', function () {
        object3DMock = sinon.mock(parentEl.object3D);
        object3DMock.expects('remove').once();
        parentEl.removeChild(el);
        process.nextTick(function () {
          object3DMock.verify();
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

  suite('remove', function () {
    test('called on object3D when removing child', function () {
      var childEl = document.createElement('vr-object');
      var object3DMock;
      var parentEl = document.createElement('vr-object');

      parentEl.appendChild(childEl);
      document.body.appendChild(parentEl);

      object3DMock = this.sinon.mock(parentEl.object3D);
      parentEl.addEventListener('loaded', function () {
        object3DMock.expects('remove').once();
        parentEl.remove(childEl);
        object3DMock.verify();
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
