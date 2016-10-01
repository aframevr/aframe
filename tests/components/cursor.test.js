/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('cursor', function () {
  /**
   * Create camera with a cursor inside.
   */
  setup(function (done) {
    var cameraEl = this.cameraEl = entityFactory();
    var cursorEl = this.cursorEl = document.createElement('a-entity');
    this.intersection = {distance: 10.5};
    this.intersectedEl = document.createElement('a-entity');
    cameraEl.setAttribute('camera', 'active: true');
    cursorEl.setAttribute('cursor', '');

    // Wait for elements to load.
    cursorEl.addEventListener('loaded', function () {
      done();
    });
    cameraEl.appendChild(cursorEl);
  });

  suite('init', function () {
    test('initializes raycasters as dependency', function () {
      assert.ok(this.cursorEl.components.raycaster);
    });
  });

  suite('onMouseDown', function () {
    test('emits mousedown event on cursorEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.addEventListener('mousedown', function () {
        done();
      });
      cursorEl.components.cursor.onMouseDown();
    });

    test('emits mousedown event on intersectedEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      intersectedEl.addEventListener('mousedown', function () {
        done();
      });
      cursorEl.components.cursor.onMouseDown();
    });

    test('sets mouseDownEl', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      assert.notOk(cursorEl.components.cursor.mouseDownEl);
      cursorEl.components.cursor.onMouseDown();
      assert.equal(cursorEl.components.cursor.mouseDownEl, intersectedEl);
    });
  });

  suite('onMouseUp', function () {
    test('emits mouseup event on cursorEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.addEventListener('mouseup', function () {
        done();
      });
      cursorEl.components.cursor.onMouseUp();
    });

    test('emits mouseup event on intersectedEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.components.cursor.mouseDownEl = document.createElement('a-entity');
      intersectedEl.addEventListener('mouseup', function () {
        done();
      });
      cursorEl.components.cursor.onMouseUp();
    });

    test('emits click event on cursorEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.components.cursor.mouseDownEl = intersectedEl;
      cursorEl.addEventListener('click', function () {
        done();
      });
      cursorEl.components.cursor.onMouseUp();
    });

    test('emits click event on intersectedEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.components.cursor.mouseDownEl = intersectedEl;
      intersectedEl.addEventListener('click', function () {
        done();
      });
      cursorEl.components.cursor.onMouseUp();
    });
  });

  suite('onIntersection', function () {
    test('does not do anything if already intersecting', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.notOk(intersectedEl.is('cursor-hovered'));
    });

    test('does not do anything if only the cursor is intersecting', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [cursorEl]
      });
      assert.notOk(cursorEl.is('cursor-hovered'));
    });

    test('sets hovered state on intersectedEl', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.ok(intersectedEl.is('cursor-hovered'));
    });

    test('emits mouseenter event on cursorEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.addEventListener('mouseenter', function (evt) {
        assert.equal(evt.detail.intersectedEl, intersectedEl);
        done();
      });
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
    });

    test('emits mouseenter event on intersectedEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      intersectedEl.addEventListener('mouseenter', function (evt) {
        assert.equal(evt.detail.cursorEl, cursorEl);
        done();
      });
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
    });

    test('emits mousenter event on intersectedEl, ignoring cursorEl intersection', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.addEventListener('mouseenter', this.fail);
      intersectedEl.addEventListener('mouseenter', function (evt) {
        assert.equal(evt.detail.cursorEl, cursorEl);
        done();
      });
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection, intersection],
        els: [cursorEl, intersectedEl]
      });
    });

    test('sets hovering state on cursor', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.ok(cursorEl.is('cursor-hovering'));
    });

    test('does not set fusing state on cursor if not fuse', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.notOk(cursorEl.is('cursor-fusing'));
    });

    test('sets fusing state on cursor if fuse', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.setAttribute('cursor', 'fuse', true);
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      assert.ok(cursorEl.is('cursor-fusing'));
    });

    test('removes fuse state and emits event on fuse click', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.setAttribute('cursor', {fuse: true, fuseTimeout: 1});
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      cursorEl.addEventListener('click', function () {
        assert.notOk(cursorEl.is('cursor-fusing'));
        done();
      });
    });

    test('emits event on intersectedEl on fuse click', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.setAttribute('cursor', {fuse: true, fuseTimeout: 1});
      cursorEl.emit('raycaster-intersection', {
        intersections: [intersection],
        els: [intersectedEl]
      });
      intersectedEl.addEventListener('click', function () {
        done();
      });
    });
  });

  suite('onIntersectionCleared', function () {
    test('does not do anything if not intersecting', function () {
      var cursorEl = this.cursorEl;
      var intersectedEl = this.intersectedEl;
      cursorEl.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('does not do anything if only the cursor is intersecting', function () {
      var cursorEl = this.cursorEl;
      cursorEl.components.cursor.intersection = this.intersection;
      cursorEl.components.cursor.intersectedEl = this.intersectedEl;
      cursorEl.emit('raycaster-intersection-cleared', {els: [cursorEl]});
      assert.ok(cursorEl.components.cursor.intersection);
      assert.ok(cursorEl.components.cursor.intersectedEl);
    });

    test('unsets intersectedEl', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(cursorEl.components.cursor.intersection);
      assert.notOk(cursorEl.components.cursor.intersectedEl);
    });

    test('removes hovered state on intersectedEl', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      intersectedEl.addState('cursor-hovered');
      cursorEl.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(intersectedEl.is('cursor-hovered'));
    });

    test('emits mouseleave event on cursorEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.addEventListener('mouseleave', function (evt) {
        assert.equal(evt.detail.intersectedEl, intersectedEl);
        done();
      });
      cursorEl.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('emits mouseleave event on intersectedEl', function (done) {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      intersectedEl.addEventListener('mouseleave', function (evt) {
        assert.equal(evt.detail.cursorEl, cursorEl);
        done();
      });
      cursorEl.emit('raycaster-intersection-cleared', {el: intersectedEl});
    });

    test('removes hovering and fusing states on cursor', function () {
      var cursorEl = this.cursorEl;
      var intersection = this.intersection;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersection = intersection;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.addState('cursor-fusing');
      cursorEl.addState('cursor-hovering');
      cursorEl.emit('raycaster-intersection-cleared', {el: intersectedEl});
      assert.notOk(cursorEl.is('cursor-fusing'));
      assert.notOk(cursorEl.is('cursor-hovering'));
    });
  });
});
