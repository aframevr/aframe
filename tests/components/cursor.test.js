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
    test('removes hover state', function (done) {
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.ok(el.is('cursor-hovering'));
      assert.ok(intersectedEl.is('cursor-hovered'));
      el.removeAttribute('cursor');
      process.nextTick(function () {
        assert.notOk(el.is('cursor-hovering'));
        assert.notOk(intersectedEl.is('cursor-hovered'));
        done();
      });
    });

    test('removes fuse state', function (done) {
      el.setAttribute('cursor', 'fuse', true);
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.ok(el.is('cursor-fusing'));
      el.removeAttribute('cursor');
      process.nextTick(function () {
        assert.notOk(el.is('cursor-fusing'));
        done();
      });
    });

    test('removes intersection listener', function (done) {
      el.removeAttribute('cursor');
      process.nextTick(function () {
        el.emit('raycaster-intersection', {
          intersections: [intersection],
          els: [intersectedEl]
        });
        assert.notOk(el.is('cursor-hovering'));
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
      component.onCursorDown();
    });

    test('emits mousedown event on intersectedEl', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(intersectedEl, 'mousedown', function () {
        done();
      });
      component.onCursorDown();
    });

    test('sets cursorDownEl', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      assert.notOk(component.cursorDownEl);
      component.onCursorDown();
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
      assert.notOk(intersectedEl.is('cursor-hovered'));
    });

    test('does not do anything if only the cursor is intersecting', function () {
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [el]
      });
      assert.notOk(el.is('cursor-hovered'));
    });

    test('sets cursor-hovered state on intersectedEl', function () {
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.ok(intersectedEl.is('cursor-hovered'));
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
      assert.ok(el.is('cursor-hovering'));
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

    test('does not set cursor-fusing state on cursor if not fuse', function () {
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.notOk(el.is('cursor-fusing'));
    });

    test('sets cursor-fusing state on cursor if fuse', function () {
      el.setAttribute('cursor', 'fuse', true);
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.ok(el.is('cursor-fusing'));
    });

    test('removes fuse state and emits event on fuse click', function (done) {
      el.setAttribute('cursor', {fuse: true, fuseTimeout: 1});
      el.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      once(el, 'click', function () {
        assert.notOk(el.is('cursor-fusing'));
        done();
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
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('does not do anything if only the cursor is intersecting', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.emit('raycaster-intersection-cleared', {els: [el]});
      assert.ok(component.intersection);
      assert.ok(component.intersectedEl);
    });

    test('unsets intersectedEl', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(component.intersection);
      assert.notOk(component.intersectedEl);
    });

    test('removes cursor-hovered state on intersectedEl', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      intersectedEl.addState('cursor-hovered');
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(intersectedEl.is('cursor-hovered'));
    });

    test('emits mouseleave event on el', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(el, 'mouseleave', function (evt) {
        assert.equal(evt.detail.intersectedEl, intersectedEl);
        done();
      });
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('emits mouseleave event on intersectedEl', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(intersectedEl, 'mouseleave', function (evt) {
        assert.equal(evt.detail.cursorEl, el);
        done();
      });
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('removes cursor-hovering and cursor-fusing states on cursor', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.addState('cursor-fusing');
      el.addState('cursor-hovering');
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(el.is('cursor-fusing'));
      assert.notOk(el.is('cursor-hovering'));
    });
  });

  suite('onIntersectionCleared', function () {
    test('does not do anything if not intersecting', function () {
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('does not do anything if only the cursor is intersecting', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.emit('raycaster-intersection-cleared', {els: [el]});
      assert.ok(component.intersection);
      assert.ok(component.intersectedEl);
    });

    test('unsets intersectedEl', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(component.intersection);
      assert.notOk(component.intersectedEl);
    });

    test('removes cursor-hovered state on intersectedEl', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      intersectedEl.addState('cursor-hovered');
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(intersectedEl.is('cursor-hovered'));
    });

    test('emits mouseleave event on el', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(el, 'mouseleave', function (evt) {
        assert.equal(evt.detail.intersectedEl, intersectedEl);
        done();
      });
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('emits mouseleave event on intersectedEl', function (done) {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      once(intersectedEl, 'mouseleave', function (evt) {
        assert.equal(evt.detail.cursorEl, el);
        done();
      });
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('removes cursor-hovering and cursor-fusing states on cursor', function () {
      component.intersection = intersection;
      component.intersectedEl = intersectedEl;
      el.addState('cursor-fusing');
      el.addState('cursor-hovering');
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(el.is('cursor-fusing'));
      assert.notOk(el.is('cursor-hovering'));
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
