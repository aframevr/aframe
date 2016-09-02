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

    test('defaults to intersecting all objects', function () {
      var el = this.el;
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      var objects;
      el.sceneEl.appendChild(el2);
      el.sceneEl.appendChild(el3);

      el.components.raycaster.refreshObjects();
      objects = el.components.raycaster.objects;
      assert.equal(objects, el.sceneEl.object3D.children);
    });

    test('can set objects to intersect', function () {
      var el = this.el;
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      el2.setAttribute('class', 'clickable');
      el.sceneEl.appendChild(el2);
      el.sceneEl.appendChild(el3);

      el.setAttribute('raycaster', 'objects', '.clickable');
      assert.equal(el.components.raycaster.objects.length, 1);
      assert.equal(el.components.raycaster.objects[0], el2.object3D);
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
    test('refresh objects when new entities are added to the scene', function (done) {
      var el = this.el;
      var newEl = this.targetEl = document.createElement('a-entity');
      var numObjects = el.components.raycaster.objects.length;
      newEl.addEventListener('loaded', function () {
        assert.equal(el.components.raycaster.objects.length, numObjects + 1);
        done();
      });
      this.el.sceneEl.appendChild(newEl);
    });

    test('refresh objects when new entities are removed from the scene', function (done) {
      var el = this.el;
      var newEl = this.targetEl = document.createElement('a-entity');
      var numObjects = el.components.raycaster.objects.length;
      var sceneEl = this.el.sceneEl;
      sceneEl.appendChild(newEl);
      sceneEl.removeChild(newEl);
      setTimeout(function () {
        assert.equal(el.components.raycaster.objects.length, numObjects);
        done();
      });
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
      targetEl.setAttribute('material', '');
      targetEl.setAttribute('position', '0 0 -1');
      targetEl.addEventListener('loaded', function finishSetup () {
        done();
      });
      el.sceneEl.appendChild(targetEl);
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
