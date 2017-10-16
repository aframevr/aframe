/* global assert, process, setup, suite, test, CustomEvent */
var entityFactory = require('../helpers').entityFactory;
var once = require('../helpers').once;

suite('cursor', function () {
  var cameraEl;
  var component;
  var el;
  var intersection;
  var intersectedEl;
  var prevIntersectedEl;

  setup(function (done) {
    cameraEl = entityFactory();
    el = document.createElement('a-entity');
    intersection = {distance: 10.5};
    intersectedEl = document.createElement('a-entity');
    prevIntersectedEl = document.createElement('a-entity');
    cameraEl.setAttribute('camera', 'active: true');
    el.setAttribute('cursor', '');
    // Wait for elements to load.
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'cursor') { return; }
      component = el.components.cursor;
      done();
    });
    cameraEl.appendChild(el);
  });

  suite('init', function () {
    test('initializes raycaster as a dependency', function () {
      assert.ok(el.components.raycaster);
    });
  });

  suite('remove', function () {
    test('removes intersection listener', function (done) {
      el.removeAttribute('cursor');
      process.nextTick(function () {
        el.emit('raycaster-intersection', {
          intersections: [intersection],
          els: [intersectedEl]
        });
        assert.notOk(el.components.intersectedEl);
        done();
      });
    });

    suite('update', function () {
      test('update mousemove event listeners when rayOrigin is the mouse', function () {
        var updateSpy = this.sinon.spy(el.components.cursor, 'update');
        var updateMouseEventListenersSpy = this.sinon.spy(el.components.cursor, 'updateMouseEventListeners');
        el.setAttribute('cursor', 'rayOrigin', 'mouse');
        assert.ok(updateSpy.called);
        assert.ok(updateMouseEventListenersSpy.called);
      });
    });
  });

  suite('onCursorDown', function () {
    test('emits mousedown event on el', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(el, 'mousedown', function () {
        done();
      });
      component.onCursorDown({});
    });

    test('emits mousedown event on intersectedEl', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(intersectedEl, 'mousedown', function () {
        done();
      });
      component.onCursorDown({});
    });

    test('sets cursorDownEl', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      assert.notOk(component.cursorDownEl);
      component.onCursorDown({});
      assert.equal(component.cursorDownEl, intersectedEl);
    });
  });

  suite('onCursorUp', function () {
    test('emits mouseup event on el', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(el, 'mouseup', function () {
        done();
      });
      component.onCursorUp();
    });

    test('emits mouseup event on intersectedEl', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      component.mouseDownEl = document.createElement('a-entity');
      once(intersectedEl, 'mouseup', function () {
        done();
      });
      component.onCursorUp();
    });

    test('emits click event on el', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      component.cursorDownEl = intersectedEl;
      once(el, 'click', function () {
        done();
      });
      component.onCursorUp();
    });

    test('emits click event on intersectedEl', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      component.cursorDownEl = intersectedEl;
      once(intersectedEl, 'click', function () {
        done();
      });
      component.onCursorUp();
    });
  });

  suite('onIntersection', function () {
    test('does not do anything if already intersecting', function () {
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [el]
      });
      assert.notOk(el.components.intersectedEl);
    });

    test('does not do anything if only the cursor is intersecting', function () {
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [el]
      });
      assert.notOk(el.components.intersectedEl);
    });

    test('emits mouseenter event on el', function (done) {
      once(el, 'mouseenter', function (evt) {
        assert.equal(evt.detail.intersectedEl, intersectedEl);
        done();
      });
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
    });

    test('emits mouseenter event on intersectedEl', function (done) {
      once(intersectedEl, 'mouseenter', function (evt) {
        assert.equal(evt.detail.cursorEl, el);
        done();
      });
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
    });

    test('emits mousenter event on intersectedEl, ignoring el intersection', function (done) {
      once(intersectedEl, 'mouseenter', function (evt) {
        assert.equal(evt.detail.cursorEl, el);
        done();
      });
      el.emit('raycaster-intersection', {
        intersections: [intersection, intersection],
        els: [el, intersectedEl]
      });
    });

    test('updates existing intersections for intersected entities', function (done, fail) {
      var intersection1 = {distance: 10.5};
      var intersection2 = {distance: 12.0};

      intersectedEl.addEventListener('mouseenter', function onMouseenter (evt) {
        assert.shallowDeepEqual(evt.detail.intersection, intersection1);

        intersectedEl.removeEventListener('mouseenter', onMouseenter);
        intersectedEl.addEventListener('mouseenter', fail);
        el.addEventListener('mouseenter', fail);

        el.emit('raycaster-intersection', {
          intersections: [intersection2],
          els: [intersectedEl]
        });

        process.nextTick(function () {
          assert.shallowDeepEqual(el.components.cursor.intersection, intersection2);
          done();
        });
      });

      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
    });

    test('emits a mouseleave event on the prevIntersectedEl', function (done) {
      once(prevIntersectedEl, 'mouseleave', function (evt) {
        done();
      });
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [prevIntersectedEl]
      });
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
    });

    test('emits event on intersectedEl on fuse click', function (done) {
      el.setAttribute('cursor', {fuse: true, fuseTimeout: 1});
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      once(intersectedEl, 'click', function () {
        done();
      });
    });
  });

  suite('onIntersectionCleared', function () {
    test('does not do anything if not intersecting', function () {
      el.emit('raycaster-intersection-cleared', {clearedEls: [intersectedEl]});
    });

    test('does not do anything if only the cursor is intersecting', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.emit('raycaster-intersection-cleared', {clearedEls: [el]});
      assert.ok(component.intersection);
      assert.ok(component.intersectedEl);
    });

    test('unsets intersectedEl', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.emit('raycaster-intersection-cleared', {clearedEls: [intersectedEl]});
      assert.notOk(component.intersection);
      assert.notOk(component.intersectedEl);
    });
  });

  suite('onMouseMove', function () {
    test('update raycaster based on mouse coordinates', function (done) {
      var event = new CustomEvent('mousemove');
      event.clientX = 5;
      event.clientY = 5;
      el.setAttribute('cursor', 'rayOrigin', 'mouse');
      window.dispatchEvent(event);
      process.nextTick(function () {
        var raycaster = el.getAttribute('raycaster');
        assert.notEqual(raycaster.direction.x, 0);
        done();
      });
    });

    test('update raycaster based on touch coordinates', function (done) {
      var event = new CustomEvent('touchstart');
      event.touches = {item: function () { return {clientX: 5, clientY: 5}; }};
      el.setAttribute('cursor', 'rayOrigin', 'mouse');
      window.dispatchEvent(event);
      process.nextTick(function () {
        var raycaster = el.getAttribute('raycaster');
        assert.notEqual(raycaster.direction.x, 0);
        done();
      });
    });
  });

  suite('canvas events', function () {
    test('cursor responds to mouse events on canvas', function () {
      // Cannot spy on onCursorDown/Up directly due to binding.
      var cursorEmitSpy = this.sinon.spy(component, 'twoWayEmit');
      var downEvt = new CustomEvent('mousedown');
      var upEvt = new CustomEvent('mouseup');
      assert.isFalse(cursorEmitSpy.calledWith('mousedown'));
      el.sceneEl.canvas.dispatchEvent(downEvt);
      assert.isTrue(cursorEmitSpy.calledWith('mousedown'));
      assert.isFalse(cursorEmitSpy.calledWith('mouseup'));
      el.sceneEl.canvas.dispatchEvent(upEvt);
      assert.isTrue(cursorEmitSpy.calledWith('mouseup'));
    });

    test('cursor responds to touch events on canvas', function () {
      // Cannot spy on onCursorDown/Up directly due to binding.
      var cursorEmitSpy = this.sinon.spy(component, 'twoWayEmit');
      var downEvt = new CustomEvent('touchstart');
      var upEvt = new CustomEvent('touchend');
      assert.isFalse(cursorEmitSpy.calledWith('mousedown'));
      el.sceneEl.canvas.dispatchEvent(downEvt);
      assert.isTrue(cursorEmitSpy.calledWith('mousedown'));
      assert.isFalse(cursorEmitSpy.calledWith('mouseup'));
      el.sceneEl.canvas.dispatchEvent(upEvt);
      assert.isTrue(cursorEmitSpy.calledWith('mouseup'));
    });
  });
});

suite('cursor + raycaster', function () {
  test('can use HTML-configured raycaster', function (done) {
    var parentEl = entityFactory();
    parentEl.addEventListener('child-attached', function (evt) {
      var el = evt.detail.el;
      el.addEventListener('loaded', function () {
        assert.equal(el.components.raycaster.data.objects, '.clickable');
        done();
      });
    });
    parentEl.innerHTML = '<a-entity cursor raycaster="objects: .clickable"></a-entity>';
  });
});
