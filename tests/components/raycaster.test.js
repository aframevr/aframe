/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('raycaster', function () {
  setup(function (done) {
    var parentEl = this.parentEl = entityFactory();
    var el = this.el = document.createElement('a-entity');
    el.setAttribute('raycaster', '');
    parentEl.addEventListener('loaded', function () {
      done();
    });
    parentEl.appendChild(el);
  });

  suite('init', function () {
    test('initializes raycaster', function () {
      assert.ok(this.el.components.raycaster.raycaster);
    });
  });

  suite('update', function () {
    test('can update far', function () {
      var el = this.el;
      el.setAttribute('raycaster', 'far', 50);
      assert.equal(el.components.raycaster.raycaster.far, 50);
    });

    test('can update near', function () {
      var el = this.el;
      el.setAttribute('raycaster', 'near', 5);
      assert.equal(el.components.raycaster.raycaster.near, 5);
    });

    test('defaults to intersecting all objects', function (done) {
      var el = this.el;
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      var i;
      var objects;
      // Add some geometry so raycast will actually work, and wait for it to be loaded.
      el2.setAttribute('geometry', 'primitive: box');
      el3.setAttribute('geometry', 'primitive: box');
      el3.addEventListener('loaded', function finishSetup () {
        el.components.raycaster.refreshObjects();
        objects = el.components.raycaster.objects;
        // The object to check raycast against isn't the object3D (which is a wrapper), but the child.
        for (i = 0; i < objects.length; i++) {
          assert.equal(objects[i], el.sceneEl.object3D.children[i].children[0]);
        }
        done();
      });
      el.sceneEl.appendChild(el2);
      el.sceneEl.appendChild(el3);
    });

    test('can set objects to intersect', function (done) {
      var el = this.el;
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      el2.setAttribute('class', 'clickable');
      // add some geometry so raycast will actually work, and wait for it to be loaded
      el2.setAttribute('geometry', 'primitive: box');
      el2.addEventListener('loaded', function finishSetup () {
        el.setAttribute('raycaster', 'objects', '.clickable');
        assert.equal(el.components.raycaster.objects.length, 1);
        // The object to check raycast against isn't the object3D (which is a wrapper), but the child.
        assert.equal(el.components.raycaster.objects[0], el2.object3D.children[0]);
        // The object to check raycast against should reference the entity.
        assert.equal(el2, el2.object3D.children[0].el);
        done();
      });
      el.sceneEl.appendChild(el2);
      el.sceneEl.appendChild(el3);
    });
  });

  suite('tick', function () {
    test('is throttled by interval', function () {
      var el = this.el;
      var intersectSpy = this.sinon.spy(el.components.raycaster.raycaster,
                                        'intersectObjects');
      el.setAttribute('raycaster', 'interval', 1000);
      el.components.raycaster.prevCheckTime = 1000;
      el.sceneEl.tick(1500);
      assert.notOk(intersectSpy.called);

      el.setAttribute('raycaster', 'interval', 499);
      el.sceneEl.tick(1500);
      assert.ok(intersectSpy.called);
    });
  });

  suite('refreshObjects', function () {
    setup(function createRaycasterAndTarget (done) {
      // Define camera and light before tests to avoid injection.
      this.el.sceneEl.appendChild(document.createElement('a-camera'));
      var waitForMe = document.createElement('a-light');
      waitForMe.addEventListener('loaded', function finishSetup () { setTimeout(function () { done(); }); });
      this.el.sceneEl.appendChild(waitForMe);
    });

    test('refresh objects when new entities are added to the scene', function (done) {
      var el = this.el;
      var newEl = document.createElement('a-entity');
      var numObjects = el.components.raycaster.objects.length;
      var sceneEl = this.el.sceneEl;
      // add some geometry so raycast will actually work
      newEl.setAttribute('geometry', 'primitive: box');
      sceneEl.addEventListener('child-attached', eventuallyDoAssert);
      sceneEl.appendChild(newEl);

      function eventuallyDoAssert () {
        if (newEl.hasLoaded) {
          doAssert();
        } else {
          newEl.addEventListener('loaded', doAssert);
        }
      }
      function doAssert () {
        sceneEl.removeEventListener('child-attached', eventuallyDoAssert);
        newEl.removeEventListener('loaded', doAssert);
        assert.equal(el.components.raycaster.objects.length, numObjects + 1);
        done();
      }
    });

    test('refresh objects when new entities are removed from the scene', function (done) {
      var el = this.el;
      var newEl = document.createElement('a-entity');
      var numObjects = el.components.raycaster.objects.length;
      var sceneEl = this.el.sceneEl;
      // add some geometry so raycast will actually work
      newEl.setAttribute('geometry', 'primitive: box');
      sceneEl.addEventListener('child-detached', doAssert);
      sceneEl.addEventListener('child-attached', eventuallyDoRemove);
      sceneEl.appendChild(newEl);

      function eventuallyDoRemove () {
        if (newEl.hasLoaded) { doRemove(); } else { newEl.addEventListener('loaded', doRemove); }
      }
      function doRemove () { sceneEl.removeChild(newEl); }
      function doAssert () {
        assert.equal(el.components.raycaster.objects.length, numObjects);
        sceneEl.removeEventListener('child-attached', eventuallyDoRemove);
        sceneEl.removeEventListener('child-detached', doAssert);
        done();
      }
    });
  });

  suite('raycaster', function () {
    setup(function createRaycasterAndTarget (done) {
      var el = this.el;
      var targetEl = this.targetEl = document.createElement('a-entity');

      el.setAttribute('position', '0 0 1');
      el.setAttribute('raycaster', {
        near: 0.1,
        far: 10
      });

      targetEl.setAttribute('geometry', 'primitive: box; depth: 1; height: 1; width: 1;');
      targetEl.setAttribute('position', '0 0 -1');
      el.sceneEl.appendChild(targetEl);
      function finishSetup () { setTimeout(function () { done(); }, 0); }
      if (targetEl.hasLoaded) { finishSetup(); } else { targetEl.addEventListener('loaded', finishSetup); }
    });

    test('can catch basic intersection', function (done) {
      this.targetEl.addEventListener('raycaster-intersected', function () { done(); });
      this.el.sceneEl.tick();
    });

    test('updates intersectedEls', function (done) {
      var raycasterEl = this.el;
      var targetEl = this.targetEl;
      assert.equal(raycasterEl.components.raycaster.intersectedEls.length, 0);
      raycasterEl.addEventListener('raycaster-intersection', function () {
        assert.equal(raycasterEl.components.raycaster.intersectedEls[0], targetEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on raycaster entity with details', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      raycasterEl.addEventListener('raycaster-intersection', function (evt) {
        assert.equal(evt.detail.els[0], targetEl);
        assert.equal(evt.detail.intersections[0].object.el, targetEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on intersected entity with details', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      targetEl.addEventListener('raycaster-intersected', function (evt) {
        assert.equal(evt.detail.el, raycasterEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on raycaster entity when clearing intersection', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      raycasterEl.addEventListener('raycaster-intersection', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '90 0 0');
        raycasterEl.addEventListener('raycaster-intersection-cleared', function (evt) {
          assert.equal(evt.detail.el, targetEl);
          done();
        });
        raycasterEl.sceneEl.tick();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on intersected entity when clearing intersection', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      targetEl.addEventListener('raycaster-intersected', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '90 0 0');
        targetEl.addEventListener('raycaster-intersected-cleared', function (evt) {
          assert.equal(evt.detail.el, raycasterEl);
          done();
        });
        raycasterEl.sceneEl.tick();
      });
      raycasterEl.sceneEl.tick();
    });
  });

  suite('non-recursive raycaster', function () {
    setup(function createRaycasterAndTarget (done) {
      var el = this.el;
      var targetEl = this.targetEl = document.createElement('a-entity');

      el.setAttribute('position', '0 0 1');
      el.setAttribute('raycaster', {
        recursive: false,
        near: 0.1,
        far: 10
      });

      targetEl.setAttribute('geometry', 'primitive: box; depth: 1; height: 1; width: 1;');
      targetEl.setAttribute('position', '0 0 -1');
      el.sceneEl.appendChild(targetEl);
      // `npm run test:forefox` needs the timeout for the tests to succeed.
      function finishSetup () {
        setTimeout(function () {
          // The object to check raycast against should reference the entity.
          assert.equal(targetEl, targetEl.object3D.children[0].el);
          done();
        }, 0);
      }
      if (targetEl.hasLoaded) { finishSetup(); } else { targetEl.addEventListener('loaded', finishSetup); }
    });

    test('can catch basic intersection', function (done) {
      this.targetEl.addEventListener('raycaster-intersected', function () { done(); });
      this.el.sceneEl.tick();
    });

    test('updates intersectedEls', function (done) {
      var raycasterEl = this.el;
      var targetEl = this.targetEl;
      assert.equal(raycasterEl.components.raycaster.intersectedEls.length, 0);
      raycasterEl.addEventListener('raycaster-intersection', function () {
        assert.equal(raycasterEl.components.raycaster.intersectedEls[0], targetEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on raycaster entity with details', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      raycasterEl.addEventListener('raycaster-intersection', function (evt) {
        assert.equal(evt.detail.els[0], targetEl);
        assert.equal(evt.detail.intersections[0].object.el, targetEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on intersected entity with details', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      targetEl.addEventListener('raycaster-intersected', function (evt) {
        assert.equal(evt.detail.el, raycasterEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on raycaster entity when clearing intersection', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      raycasterEl.addEventListener('raycaster-intersection', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '90 0 0');
        raycasterEl.addEventListener('raycaster-intersection-cleared', function (evt) {
          assert.equal(evt.detail.el, targetEl);
          done();
        });
        raycasterEl.sceneEl.tick();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on intersected entity when clearing intersection', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      targetEl.addEventListener('raycaster-intersected', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '90 0 0');
        targetEl.addEventListener('raycaster-intersected-cleared', function (evt) {
          assert.equal(evt.detail.el, raycasterEl);
          done();
        });
        raycasterEl.sceneEl.tick();
      });
      raycasterEl.sceneEl.tick();
    });
  });

  suite('updateOriginDirection', function () {
    test('updates ray origin if position changes', function () {
      var el = this.el;
      var origin;
      el.setAttribute('position', '1 2 3');
      el.sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      el.sceneEl.tick();
      origin = el.components.raycaster.raycaster.ray.origin;
      assert.equal(origin.x, 1);
      assert.equal(origin.y, 2);
      assert.equal(origin.z, 3);
    });

    test('updates ray origin if parent position changes', function () {
      var el = this.el;
      var parentEl = this.parentEl;
      var origin;
      parentEl.setAttribute('position', '1 2 3');
      el.sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      el.sceneEl.tick();
      origin = el.components.raycaster.raycaster.ray.origin;
      assert.equal(origin.x, 1);
      assert.equal(origin.y, 2);
      assert.equal(origin.z, 3);
    });

    test('defaults ray direction to 0 0 -1', function () {
      var el = this.el;
      var direction = el.components.raycaster.raycaster.ray.direction;
      assert.equal(direction.x, 0);
      assert.equal(direction.y, 0);
      assert.equal(direction.z, -1);
    });

    test('updates ray direction if rotation changes', function () {
      var el = this.el;
      var direction;
      el.setAttribute('rotation', '180 0 0');
      el.sceneEl.tick();
      direction = el.components.raycaster.raycaster.ray.direction;
      assert.equal(Math.floor(direction.x), 0);
      assert.equal(Math.floor(direction.y), 0);
      assert.equal(direction.z, 1);
    });

    test('updates ray direction if parent rotation changes', function () {
      var el = this.el;
      var parentEl = this.parentEl;
      var direction;
      parentEl.setAttribute('rotation', '180 0 0');
      el.sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      el.sceneEl.tick();
      direction = el.components.raycaster.raycaster.ray.direction;
      assert.equal(Math.floor(direction.x), 0);
      assert.equal(Math.floor(direction.y), 0);
      assert.equal(direction.z, 1);
    });
  });
});
