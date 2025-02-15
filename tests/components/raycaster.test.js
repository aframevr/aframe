/* global assert, setup, suite, test, THREE */
import { entityFactory } from '../helpers.js';

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
      const wrapper = document.createElement('a-entity');
      const el2 = document.createElement('a-entity');
      const el3 = document.createElement('a-entity');

      // Add geometry to test raycast and wait for them to be loaded.
      el2.setAttribute('geometry', 'primitive: box');
      el3.setAttribute('geometry', 'primitive: box');

      el3.addEventListener('loaded', () => {
        component.refreshObjects();
        // Check that groups are not the raycast targets.
        for (let i = 0; i < component.objects.length; i++) {
          assert.notEqual(component.objects[i], sceneEl.object3D.children[i].object3D);
        }
        assert.ok(component.objects.includes(el2.getObject3D('mesh')));
        assert.ok(component.objects.includes(el3.getObject3D('mesh')));
        done();
      });
      wrapper.appendChild(el2);
      wrapper.appendChild(el3);
      sceneEl.appendChild(wrapper);
    });

    test('does not include non-object3DMap children in objects', function (done) {
      var dummyObject3D;
      var el2 = document.createElement('a-entity');

      // Add geometry to test raycast and wait for them to be loaded.
      el2.setAttribute('geometry', 'primitive: box');

      dummyObject3D = new THREE.Object3D();
      el2.object3D.add(dummyObject3D);

      el2.addEventListener('loaded', function () {
        component.refreshObjects();
        assert.equal(component.objects.indexOf(dummyObject3D), -1);
        assert.notEqual(component.objects.indexOf(el2.getObject3D('mesh')), -1);
        done();
      });
      sceneEl.appendChild(el2);
    });

    test('cannot have redundant objects', function (done) {
      const el1 = document.createElement('a-entity');
      el1.setAttribute('geometry', 'primitive: box');
      const el2 = document.createElement('a-entity');
      el2.setAttribute('geometry', 'primitive: box');
      el1.appendChild(el2);

      el1.addEventListener('loaded', function () {
        component.refreshObjects();
        const mesh = el2.getObject3D('mesh');
        let count = 0;
        component.objects.forEach(obj => {
          if (obj === mesh) { count++; }
        });
        assert.equal(count, 1);
        done();
      });
      sceneEl.appendChild(el1);
    });

    test('can whitelist objects to intersect', function (done) {
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      el2.setAttribute('class', 'clickable');
      el2.setAttribute('geometry', 'primitive: box');
      el2.addEventListener('loaded', function () {
        el.setAttribute('raycaster', 'objects', '.clickable');
        component.tock();
        assert.equal(component.objects.length, 1);
        assert.equal(component.objects[0], el2.object3D.children[0]);
        assert.equal(el2, el2.object3D.children[0].el);
        done();
      });
      sceneEl.appendChild(el2);
      sceneEl.appendChild(el3);
    });
  });

  test('Objects not attached to scene are not whitelisted', function (done) {
    var el2 = document.createElement('a-entity');
    var el3 = document.createElement('a-entity');
    el2.setAttribute('class', 'clickable');
    el2.setAttribute('geometry', 'primitive: box');
    el3.setAttribute('class', 'clickable');
    el3.setAttribute('geometry', 'primitive: box');
    el3.addEventListener('loaded', function () {
      el3.object3D.parent = null;
      el.setAttribute('raycaster', 'objects', '.clickable');
      component.tock();
      assert.equal(component.objects.length, 1);
      assert.equal(component.objects[0], el2.object3D.children[0]);
      assert.equal(el2, el2.object3D.children[0].el);
      done();
    });
    sceneEl.appendChild(el2);
    sceneEl.appendChild(el3);
  });

  test('Objects with parent not attached to scene are not whitelisted', function (done) {
    var el2 = document.createElement('a-entity');
    var el3 = document.createElement('a-entity');
    el2.setAttribute('class', 'clickable');
    el2.setAttribute('geometry', 'primitive: box');
    el3.setAttribute('class', 'clickable');
    el3.setAttribute('geometry', 'primitive: box');
    el3.addEventListener('loaded', function () {
      el2.object3D.parent = null;
      el.setAttribute('raycaster', 'objects', '.clickable');
      component.tock();
      assert.equal(component.objects.length, 0);
      done();
    });
    sceneEl.appendChild(el2);
    el2.appendChild(el3);
  });

  suite('tock', function () {
    test('is throttled by interval', function () {
      var intersectSpy = this.sinon.spy(raycaster, 'intersectObjects');
      el.setAttribute('raycaster', 'interval', 1000);
      component.prevCheckTime = 1000;
      component.tock(1500);
      assert.notOk(intersectSpy.called);

      el.setAttribute('raycaster', 'interval', 499);
      component.tock(1500);
      assert.ok(intersectSpy.called);
    });
  });

  suite('remove', function () {
    test('removes line', function () {
      el.setAttribute('raycaster', 'showLine', true);
      assert.ok(el.getObject3D('line'));
      el.removeAttribute('raycaster');
      assert.notOk(el.getObject3D('line'));
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
      component.tock();
      var numObjects = component.objects.length;
      newEl.setAttribute('geometry', 'primitive: box');
      newEl.addEventListener('loaded', function () {
        component.tock();
        assert.equal(component.objects.length, numObjects + 1);
        done();
      });
      sceneEl.appendChild(newEl);
    });

    test('refresh objects when new entities are removed from the scene', function (done) {
      var newEl = document.createElement('a-entity');
      component.tock();
      var numObjects = component.objects.length;
      newEl.setAttribute('geometry', 'primitive: box');
      sceneEl.addEventListener('child-detached', function doAssert () {
        component.tock();
        assert.equal(component.objects.length, numObjects);
        sceneEl.removeEventListener('child-detached', doAssert);
        done();
      });
      newEl.addEventListener('loaded', function () {
        sceneEl.removeChild(newEl);
      });
      sceneEl.appendChild(newEl);
    });

    test('refresh objects when entities are modified', function (done) {
      el.setAttribute('raycaster', {objects: '[ray-target]'});
      var newEl = document.createElement('a-entity');
      newEl.setAttribute('geometry', 'primitive: box');
      newEl.addEventListener('loaded', function doAssert () {
        component.tock();
        assert.equal(component.objects.length, 0);
        newEl.setAttribute('ray-target', '');
        setTimeout(function () {
          component.tock();
          assert.equal(component.objects.length, 1);
          sceneEl.removeEventListener('child-attached', doAssert);
          done();
        }, 0);
      });
      sceneEl.appendChild(newEl);
    });

    test('refresh objects when setObject3D() or removeObject3D() is called', function () {
      el.setAttribute('raycaster', {objects: '[ray-target]'});
      component.tock();
      assert.equal(component.dirty, false);
      sceneEl.emit('object3dset');
      assert.equal(component.dirty, true);
      component.tock();
      assert.equal(component.dirty, false);
      sceneEl.emit('object3dremove');
      assert.equal(component.dirty, true);
    });
  });

  suite('raycaster', function () {
    var targetEl;

    setup(function (done) {
      targetEl = document.createElement('a-entity');

      el.setAttribute('position', '0 0 1');
      el.setAttribute('raycaster', {near: 0.1, far: 10});

      targetEl.setAttribute('id', 'target');
      targetEl.setAttribute('geometry', 'primitive: box');
      targetEl.setAttribute('position', '0 0 -1');
      targetEl.addEventListener('loaded', function () {
        setTimeout(() => { done(); });
      });
      sceneEl.appendChild(targetEl);
    });

    test('can catch basic intersection', function (done) {
      targetEl.addEventListener('raycaster-intersected', function (evt) {
        assert.ok(evt.detail.getIntersection(targetEl));
        done();
      });
      component.tock();
    });

    test('updates intersectedEls', function (done) {
      var raycasterEl = el;
      assert.equal(component.intersectedEls.length, 0);
      raycasterEl.addEventListener('raycaster-intersection', function () {
        assert.equal(component.intersectedEls[0], targetEl);
        done();
      });
      component.tock();
    });

    test('emits event on raycaster entity with details', function (done) {
      var raycasterEl = el;
      raycasterEl.addEventListener('raycaster-intersection', function (evt) {
        assert.equal(evt.detail.els[0], targetEl);
        assert.equal(evt.detail.intersections[0].object.el, targetEl);
        done();
      });
      component.tock();
    });

    test('does not re-emit raycaster-intersection if no new intersections', function (done) {
      var count = 0;
      var raycasterEl = el;
      raycasterEl.addEventListener('raycaster-intersection', function () {
        count++;
      });
      component.tock();
      component.tock();
      setTimeout(() => {
        assert.equal(count, 1);
        done();
      });
    });

    test('does not re-emit raycaster-intersected if previously intersecting', function (done) {
      var count = 0;
      targetEl.addEventListener('raycaster-intersected', function (evt) {
        count++;
      });
      component.tock();
      component.tock();
      component.tock();
      setTimeout(() => {
        // 2 because the raycaster hits the box in two points.
        assert.equal(count, 2);
        done();
      });
    });

    test('emits event on intersected entity with details', function (done) {
      var raycasterEl = el;
      targetEl.addEventListener('raycaster-intersected', function (evt) {
        assert.equal(evt.detail.el, raycasterEl);
        done();
      });
      component.tock();
    });

    test('emits event on raycaster entity when clearing intersection', function (done) {
      var raycasterEl = el;
      raycasterEl.addEventListener('raycaster-intersection', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '90 0 0');
        raycasterEl.addEventListener('raycaster-intersection-cleared', function cb (evt) {
          assert.notEqual(component.clearedIntersectedEls.indexOf(targetEl), -1);
          raycasterEl.removeEventListener('raycaster-intersection-cleared', cb);
          done();
        }, {once: true});
        component.tock();
      });
      component.tock();
    });

    test('emits event on intersected entity when clearing intersection', function (done) {
      var raycasterEl = el;
      targetEl.addEventListener('raycaster-intersected', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('rotation', '-90 0 0');
        targetEl.addEventListener('raycaster-intersected-cleared', function (evt) {
          assert.equal(evt.detail.el, raycasterEl);
          done();
        }, {once: true});
        component.tock();
      });
      component.tock();
    });

    test('clears intersections when disabled', function (done) {
      targetEl.addEventListener('raycaster-intersected', function () {
        targetEl.addEventListener('raycaster-intersected-cleared', function () {
          done();
        }, {once: true});
        assert.equal(component.intersectedEls.length, 2);
        assert.equal(component.clearedIntersectedEls.length, 0);
        el.setAttribute('raycaster', 'enabled', false);
        assert.equal(component.intersectedEls.length, 0);
        assert.equal(component.intersections.length, 0);
        assert.equal(component.clearedIntersectedEls.length, 2);
      }, {once: true});
      component.tock();
    });

    test('emits intersectioncleared when disabled', function (done) {
      targetEl.addEventListener('raycaster-intersected', function () {
        el.addEventListener('raycaster-intersection-cleared', function () {
          done();
        }, {once: true});
        el.setAttribute('raycaster', 'enabled', false);
      });
      component.tock();
    });
  });

  suite('updateOriginDirection', function () {
    test('updates ray origin if position changes', function () {
      var origin;
      el.setAttribute('position', '1 2 3');
      sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      component.tock();
      origin = raycaster.ray.origin;
      assert.equal(origin.x, 1);
      assert.equal(origin.y, 2);
      assert.equal(origin.z, 3);
    });

    test('updates ray origin if parent position changes', function () {
      var origin;
      parentEl.setAttribute('position', '1 2 3');
      sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      component.tock();
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
      component.tock();
      direction = raycaster.ray.direction;
      assert.equal(Math.floor(direction.x), 0);
      assert.equal(Math.floor(direction.y), 0);
      assert.equal(direction.z, 1);
    });

    test('updates ray direction if parent rotation changes', function () {
      var direction;
      parentEl.setAttribute('rotation', '180 0 0');
      sceneEl.object3D.updateMatrixWorld();
      component.tock();
      direction = raycaster.ray.direction;
      assert.equal(Math.floor(direction.x), 0);
      assert.equal(Math.floor(direction.y), 0);
      assert.equal(direction.z, 1);
    });

    test('can specify origin', function () {
      var origin;
      el.setAttribute('position', '5 5 5');
      el.setAttribute('raycaster', 'origin', '0 -1 1');
      sceneEl.object3D.updateMatrixWorld();
      component.tock();
      origin = raycaster.ray.origin;
      assert.equal(origin.x, 5);
      assert.equal(origin.y, 4);
      assert.equal(origin.z, 6);

      el.setAttribute('rotation', '180 0 0');
      sceneEl.object3D.updateMatrixWorld();
      component.tock();
      assert.equal(origin.x, 5);
      assert.equal(origin.y, 6);
      assert.equal(origin.z, 4);
    });

    test('can specify direction', function () {
      var direction;
      el.setAttribute('raycaster', 'direction', '0 -1 0');
      sceneEl.object3D.updateMatrixWorld();
      component.tock();
      direction = raycaster.ray.direction;
      assert.equal(direction.x, 0);
      assert.equal(direction.y, -1);
      assert.equal(direction.z, 0);

      el.setAttribute('rotation', '0 0 180');
      component.tock();
      direction = raycaster.ray.direction;
      assert.equal(direction.y, 1);
    });

    test('applies origin and direction without transformation if worldCoordinates enabled', function () {
      el.setAttribute('raycaster', 'useWorldCoordinates', true);
      el.setAttribute('raycaster', 'origin', '1 1 1');
      el.setAttribute('raycaster', 'direction', '2 2 2');
      el.setAttribute('position', '5 5 5');
      el.setAttribute('rotation', '30 45 90');
      sceneEl.object3D.updateMatrixWorld();  // Normally handled by renderer.
      component.tock();
      var origin = raycaster.ray.origin;
      var direction = raycaster.ray.direction;
      assert.equal(origin.x, 1);
      assert.equal(origin.y, 1);
      assert.equal(origin.z, 1);
      assert.equal(direction.x, 2);
      assert.equal(direction.y, 2);
      assert.equal(direction.z, 2);
    });
  });

  suite('line', function () {
    setup(function () {
      el.setAttribute('raycaster', 'showLine', true);
    });

    test('creates line', function () {
      var lineData;
      assert.ok(el.getObject3D('line'));
      lineData = el.getAttribute('line');
      assert.shallowDeepEqual(lineData.start, {x: 0, y: 0, z: 0});
      assert.shallowDeepEqual(lineData.end, {x: 0, y: 0, z: -1000});
    });

    test('can remove line', function () {
      el.setAttribute('raycaster', 'showLine', false);
      assert.notOk(el.getObject3D('line'));
    });

    test('matches direction', function () {
      var lineData;
      el.setAttribute('raycaster', 'direction', '0 -1 -1');
      lineData = el.getAttribute('line');
      assert.equal(Math.round(lineData.end.y), -707);
      assert.equal(Math.round(lineData.end.z), -707);
    });

    test('matches origin', function () {
      var lineData;
      el.setAttribute('raycaster', 'origin', '5 10 -20');
      lineData = el.getAttribute('line');
      assert.shallowDeepEqual(lineData.start, {x: 5, y: 10, z: -20});
    });

    test('truncates length to point of intersection', function (done) {
      var box;
      var line;

      el.setAttribute('raycaster', {direction: '0 0 -1', origin: '0 0 0'});
      line = el.getAttribute('line');
      assert.equal(new THREE.Vector3().copy(line.start).sub(line.end).length(), 1000);

      box = document.createElement('a-entity');
      box.setAttribute('geometry', {primitive: 'box', width: 1, height: 1, depth: 1});
      box.setAttribute('position', '0 0 -25');
      sceneEl.appendChild(box);

      box.addEventListener('loaded', function () {
        el.sceneEl.object3D.updateMatrixWorld();
        component.refreshObjects();
        component.tock();
        setTimeout(() => {
          line = el.getAttribute('line');
          assert.equal(new THREE.Vector3().copy(line.start).sub(line.end).length(), 24.5);
          box.parentNode.removeChild(box);
          setTimeout(() => {
            component.tock();
            setTimeout(() => {
              line = el.getAttribute('line');
              assert.equal(new THREE.Vector3().copy(line.start).sub(line.end).length(), 1000);
              done();
            });
          });
        });
      });
    });

    test('truncates line length with two raycasters', function (done) {
      var box;
      var rayEl2;
      var line;
      var lineArray;
      var lineStart = new THREE.Vector3();
      var lineEnd = new THREE.Vector3();

      el.setAttribute('raycaster', {direction: '0 0 -1', origin: '0 0 0', objects: '#target'});
      lineArray = el.components.line.geometry.attributes.position.array;

      rayEl2 = document.createElement('a-entity');
      rayEl2.setAttribute('raycaster', {
        direction: '0 0 -1',
        origin: '0 0 0',
        showLine: true,
        objects: '#target'
      });
      sceneEl.appendChild(rayEl2);

      line = el.getAttribute('line');
      assert.equal(new THREE.Vector3().copy(line.start).sub(line.end).length(), 1000);
      lineEnd.fromArray(lineArray, 3);
      assert.equal(lineStart.fromArray(lineArray).sub(lineEnd).length(), 1000);

      box = document.createElement('a-entity');
      box.id = 'target';
      box.setAttribute('geometry', {primitive: 'box', width: 1, height: 1, depth: 1});
      box.setAttribute('position', '0 0 -25');
      sceneEl.appendChild(box);

      box.addEventListener('loaded', function () {
        el.sceneEl.object3D.updateMatrixWorld();
        component.refreshObjects();
        component.tock();
        rayEl2.components.raycaster.tock();
        rayEl2.components.raycaster.tock();
        setTimeout(() => {
          // Ensure component and geometry are unaffected by other raycaster
          line = el.getAttribute('line');
          assert.equal(new THREE.Vector3().copy(line.start).sub(line.end).length(), 24.5);
          lineEnd.fromArray(lineArray, 3);
          assert.equal(lineStart.fromArray(lineArray).sub(lineEnd).length(), 24.5);
          box.parentNode.removeChild(box);
          setTimeout(() => {
            component.tock();
            setTimeout(() => {
              line = el.getAttribute('line');
              assert.equal(new THREE.Vector3().copy(line.start).sub(line.end).length(), 1000);
              lineEnd.fromArray(lineArray, 3);
              assert.equal(lineStart.fromArray(lineArray).sub(lineEnd).length(), 1000);
              done();
            });
          });
        });
      });
    });
  });
});
