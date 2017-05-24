/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('raycaster', function () {
  var component;
  var el;
  var parentEl;
  var raycaster;
  var sceneEl;

  setup(function (done) {
    parentEl = entityFactory();
    el = document.createElement('a-entity');
    el.setAttribute('raycaster', '');
    el.addEventListener('componentinitialized', evt => {
      if (evt.detail.name !== 'raycaster') { return; }
      component = el.components.raycaster;
      raycaster = component.raycaster;
      sceneEl = el.sceneEl;
      done();
    });
    parentEl.appendChild(el);
  });

  suite('init', function () {
    test('initializes raycaster', function () {
      assert.ok(raycaster);
    });
  });

  suite('update', function () {
    test('can update far', function () {
      el.setAttribute('raycaster', 'far', 50);
      assert.equal(raycaster.far, 50);
    });

    test('can update near', function () {
      el.setAttribute('raycaster', 'near', 5);
      assert.equal(raycaster.near, 5);
    });

    test('defaults to intersecting all objects', function (done) {
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      var i;

      // Add geometry to test raycast and wait for them to be loaded.
      el2.setAttribute('geometry', 'primitive: box');
      el3.setAttribute('geometry', 'primitive: box');

      el3.addEventListener('loaded', function () {
        component.refreshObjects();
        // Check that the child is the raycaster target, not the THREE.Group.
        for (i = 0; i < component.objects.length; i++) {
          assert.equal(component.objects[i], sceneEl.object3D.children[i].children[0]);
        }
        done();
      });
      sceneEl.appendChild(el2);
      sceneEl.appendChild(el3);
    });

    test('can whitelist objects to intersect', function (done) {
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      el2.setAttribute('class', 'clickable');
      el2.setAttribute('geometry', 'primitive: box');
      el2.addEventListener('loaded', function () {
        el.setAttribute('raycaster', 'objects', '.clickable');
        assert.equal(component.objects.length, 1);
        assert.equal(component.objects[0], el2.object3D.children[0]);
        assert.equal(el2, el2.object3D.children[0].el);
        done();
      });
      sceneEl.appendChild(el2);
      sceneEl.appendChild(el3);
    });
  });

  suite('tick', function () {
    test('is throttled by interval', function () {
      var intersectSpy = this.sinon.spy(raycaster, 'intersectObjects');
      el.setAttribute('raycaster', 'interval', 1000);
      component.prevCheckTime = 1000;
      component.tick(1500);
      assert.notOk(intersectSpy.called);

      el.setAttribute('raycaster', 'interval', 499);
      component.tick(1500);
      assert.ok(intersectSpy.called);
    });
  });

  suite('refreshObjects', function () {
    setup(function (done) {
      var light;
      // Define camera and light before tests to avoid injection.
      sceneEl.appendChild(document.createElement('a-camera'));
      light = document.createElement('a-light');
      light.addEventListener('loaded', function () {
        // Wait for raycaster to pick them up.
        setTimeout(() => { done(); });
      });
      sceneEl.appendChild(light);
    });

    test('refresh objects when new entities are added to the scene', function (done) {
      var newEl = document.createElement('a-entity');
      var numObjects = component.objects.length;
      newEl.setAttribute('geometry', 'primitive: box');
      newEl.addEventListener('loaded', function () {
        setTimeout(() => {
          assert.equal(component.objects.length, numObjects + 1);
          done();
        });
      });
      sceneEl.appendChild(newEl);
    });

    test('refresh objects when new entities are removed from the scene', function (done) {
      var newEl = document.createElement('a-entity');
      var numObjects = component.objects.length;
      newEl.setAttribute('geometry', 'primitive: box');
      sceneEl.addEventListener('child-detached', function doAssert () {
        setTimeout(() => {
          assert.equal(component.objects.length, numObjects);
          sceneEl.removeEventListener('child-detached', doAssert);
          done();
        });
      });
      newEl.addEventListener('loaded', function () {
        sceneEl.removeChild(newEl);
      });
      sceneEl.appendChild(newEl);
    });
  });

  suite('raycaster', function () {
    var targetEl;

    setup(function (done) {
      targetEl = document.createElement('a-entity');

      el.setAttribute('position', '0 0 1');
      el.setAttribute('raycaster', {near: 0.1, far: 10});

      targetEl.setAttribute('geometry', 'primitive: box');
      targetEl.setAttribute('position', '0 0 -1');
      targetEl.addEventListener('loaded', function () {
        setTimeout(() => { done(); });
      });
      sceneEl.appendChild(targetEl);
    });

    test('can catch basic intersection', function (done) {
      targetEl.addEventListener('raycaster-intersected', function () { done(); });
      component.tick();
    });

    test('updates intersectedEls', function (done) {
      var raycasterEl = el;
      assert.equal(component.intersectedEls.length, 0);
      raycasterEl.addEventListener('raycaster-intersection', function () {
        assert.equal(component.intersectedEls[0], targetEl);
        done();
      });
      component.tick();
    });

    test('emits event on raycaster entity with details', function (done) {
      var raycasterEl = el;
      raycasterEl.addEventListener('raycaster-intersection', function (evt) {
        assert.equal(evt.detail.els[0], targetEl);
        assert.equal(evt.detail.intersections[0].object.el, targetEl);
        done();
      });
      component.tick();
    });

    test('emits event on intersected entity with details', function (done) {
      var raycasterEl = el;
      targetEl.addEventListener('raycaster-intersected', function (evt) {
        assert.equal(evt.detail.el, raycasterEl);
        done();
      });
      component.tick();
    });

    test('emits event on raycaster entity when clearing intersection', function (done) {
      var raycasterEl = el;
      raycasterEl.addEventListener('raycaster-intersection', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '90 0 0');
        raycasterEl.addEventListener('raycaster-intersection-cleared', function (evt) {
          assert.equal(evt.detail.el, targetEl);
          done();
        });
        component.tick();
      });
      component.tick();
    });

    test('emits event on intersected entity when clearing intersection', function (done) {
      var raycasterEl = el;
      targetEl.addEventListener('raycaster-intersected', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '90 0 0');
        targetEl.addEventListener('raycaster-intersected-cleared', function (evt) {
          assert.equal(evt.detail.el, raycasterEl);
          done();
        });
        component.tick();
      });
      component.tick();
    });
  });

  suite('non-recursive raycaster', function () {
    var targetEl;

    setup(function (done) {
      targetEl = document.createElement('a-entity');

      el.setAttribute('position', '0 0 1');
      el.setAttribute('raycaster', {recursive: false, near: 0.1, far: 10});

      targetEl.setAttribute('geometry', 'primitive: box');
      targetEl.setAttribute('position', '0 0 -1');
      targetEl.addEventListener('loaded', function () {
        setTimeout(() => { done(); });
      });
      sceneEl.appendChild(targetEl);
    });

    test('can catch basic intersection', function (done) {
      targetEl.addEventListener('raycaster-intersected', function () { done(); });
      component.tick();
    });
  });

  suite('updateOriginDirection', function () {
    test('updates ray origin if position changes', function () {
      var origin;
      el.setAttribute('position', '1 2 3');
      sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      component.tick();
      origin = raycaster.ray.origin;
      assert.equal(origin.x, 1);
      assert.equal(origin.y, 2);
      assert.equal(origin.z, 3);
    });

    test('updates ray origin if parent position changes', function () {
      var origin;
      parentEl.setAttribute('position', '1 2 3');
      sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      component.tick();
      origin = raycaster.ray.origin;
      assert.equal(origin.x, 1);
      assert.equal(origin.y, 2);
      assert.equal(origin.z, 3);
    });

    test('defaults ray direction to 0 0 -1', function () {
      var direction = raycaster.ray.direction;
      assert.equal(direction.x, 0);
      assert.equal(direction.y, 0);
      assert.equal(direction.z, -1);
    });

    test('updates ray direction if rotation changes', function () {
      var direction;
      el.setAttribute('rotation', '180 0 0');
      component.tick();
      direction = raycaster.ray.direction;
      assert.equal(Math.floor(direction.x), 0);
      assert.equal(Math.floor(direction.y), 0);
      assert.equal(direction.z, 1);
    });

    test('updates ray direction if parent rotation changes', function () {
      var direction;
      parentEl.setAttribute('rotation', '180 0 0');
      sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      component.tick();
      direction = raycaster.ray.direction;
      assert.equal(Math.floor(direction.x), 0);
      assert.equal(Math.floor(direction.y), 0);
      assert.equal(direction.z, 1);
    });
  });
});
