/* global THREE */
var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

var bind = utils.bind;

var EVENTS = {
  CLICK: 'click',
  FUSING: 'fusing',
  MOUSEENTER: 'mouseenter',
  MOUSEDOWN: 'mousedown',
  MOUSELEAVE: 'mouseleave',
  MOUSEUP: 'mouseup'
};

var CANVAS_EVENTS = {
  DOWN: ['mousedown', 'touchstart'],
  UP: ['mouseup', 'touchend']
};

/**
 * Cursor component. Applies the raycaster component specifically for starting the raycaster
 * from the camera and pointing from camera's facing direction, and then only returning the
 * closest intersection. Cursor can be fine-tuned by setting raycaster properties.
 *
 * @member {object} fuseTimeout - Timeout to trigger fuse-click.
 * @member {Element} cursorDownEl - Entity that was last mousedowned during current click.
 * @member {object} intersection - Attributes of the current intersection event, including
 *         3D- and 2D-space coordinates. See: http://threejs.org/docs/api/core/Raycaster.html
 * @member {Element} intersectedEl - Currently-intersected entity. Used to keep track to
 *         emit events when unintersecting.
 */
module.exports.Component = registerComponent('cursor', {
  dependencies: ['raycaster'],

  schema: {
    downEvents: {default: []},
    fuse: {default: utils.device.isMobile()},
    fuseTimeout: {default: 1500, min: 0},
    upEvents: {default: []},
    rayOrigin: {default: 'entity', oneOf: ['mouse', 'entity']}
  },

  init: function () {
    var self = this;

    this.fuseTimeout = undefined;
    this.cursorDownEl = null;
    this.intersection = null;
    this.intersectedEl = null;
    this.canvasBounds = document.body.getBoundingClientRect();

    // Debounce.
    this.updateCanvasBounds = utils.debounce(function updateCanvasBounds () {
      self.canvasBounds = self.el.sceneEl.canvas.getBoundingClientRect();
    }, 200);

    // Bind methods.
    this.onCursorDown = bind(this.onCursorDown, this);
    this.onCursorUp = bind(this.onCursorUp, this);
    this.onIntersection = bind(this.onIntersection, this);
    this.onIntersectionCleared = bind(this.onIntersectionCleared, this);
    this.onMouseMove = bind(this.onMouseMove, this);
  },

  update: function (oldData) {
    if (this.data.rayOrigin === oldData.rayOrigin) { return; }
    this.updateMouseEventListeners();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  remove: function () {
    clearTimeout(this.fuseTimeout);
    this.removeEventListeners();
  },

  addEventListeners: function () {
    var canvas;
    var data = this.data;
    var el = this.el;
    var self = this;

    function addCanvasListeners () {
      canvas = el.sceneEl.canvas;
      CANVAS_EVENTS.DOWN.forEach(function (downEvent) {
        canvas.addEventListener(downEvent, self.onCursorDown);
      });
      CANVAS_EVENTS.UP.forEach(function (upEvent) {
        canvas.addEventListener(upEvent, self.onCursorUp);
      });
    }

    canvas = el.sceneEl.canvas;
    if (canvas) {
      addCanvasListeners();
    } else {
      el.sceneEl.addEventListener('render-target-loaded', addCanvasListeners);
    }

    data.downEvents.forEach(function (downEvent) {
      el.addEventListener(downEvent, self.onCursorDown);
    });
    data.upEvents.forEach(function (upEvent) {
      el.addEventListener(upEvent, self.onCursorUp);
    });
    el.addEventListener('raycaster-intersection', this.onIntersection);
    el.addEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);

    window.addEventListener('resize', this.updateCanvasBounds);
  },

  removeEventListeners: function () {
    var canvas;
    var data = this.data;
    var el = this.el;
    var self = this;

    canvas = el.sceneEl.canvas;
    if (canvas) {
      CANVAS_EVENTS.DOWN.forEach(function (downEvent) {
        canvas.removeEventListener(downEvent, self.onCursorDown);
      });
      CANVAS_EVENTS.UP.forEach(function (upEvent) {
        canvas.removeEventListener(upEvent, self.onCursorUp);
      });
    }

    data.downEvents.forEach(function (downEvent) {
      el.removeEventListener(downEvent, self.onCursorDown);
    });
    data.upEvents.forEach(function (upEvent) {
      el.removeEventListener(upEvent, self.onCursorUp);
    });
    el.removeEventListener('raycaster-intersection', this.onIntersection);
    el.removeEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchstart', this.onMouseMove);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('resize', this.updateCanvasBounds);
  },

  updateMouseEventListeners: function () {
    var el = this.el;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchstart', this.onMouseMove);
    window.removeEventListener('touchmove', this.onMouseMove);
    el.setAttribute('raycaster', 'useWorldCoordinates', false);
    if (this.data.rayOrigin !== 'mouse') { return; }
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener('touchstart', this.onMouseMove, false);
    window.addEventListener('touchmove', this.onMouseMove, false);
    el.setAttribute('raycaster', 'useWorldCoordinates', true);
    this.updateCanvasBounds();
  },

  onMouseMove: (function () {
    var direction = new THREE.Vector3();
    var mouse = new THREE.Vector2();
    var origin = new THREE.Vector3();
    var rayCasterConfig = {origin: origin, direction: direction};

    return function (evt) {
      var bounds = this.canvasBounds;
      var camera = this.el.sceneEl.camera;
      var left;
      var point;
      var top;

      camera.parent.updateMatrixWorld();
      camera.updateMatrixWorld();

      // Calculate mouse position based on the canvas element
      if (evt.type === 'touchmove' || evt.type === 'touchstart') {
        // Track the first touch for simplicity.
        point = evt.touches.item(0);
      } else {
        point = evt;
      }

      left = point.clientX - bounds.left;
      top = point.clientY - bounds.top;
      mouse.x = (left / bounds.width) * 2 - 1;
      mouse.y = -(top / bounds.height) * 2 + 1;

      origin.setFromMatrixPosition(camera.matrixWorld);
      direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(origin).normalize();
      this.el.setAttribute('raycaster', rayCasterConfig);
      if (evt.type === 'touchstart' || evt.type === 'touchmove') { evt.preventDefault(); }
    };
  })(),

  /**
   * Trigger mousedown and keep track of the mousedowned entity.
   */
  onCursorDown: function (evt) {
    this.twoWayEmit(EVENTS.MOUSEDOWN);
    this.cursorDownEl = this.intersectedEl;
    if (evt.type === 'touchstart') { evt.preventDefault(); }
  },

  /**
   * Trigger mouseup if:
   * - Not fusing (mobile has no mouse).
   * - Currently intersecting an entity.
   * - Currently-intersected entity is the same as the one when mousedown was triggered,
   *   in case user mousedowned one entity, dragged to another, and mouseupped.
   */
  onCursorUp: function (evt) {
    this.twoWayEmit(EVENTS.MOUSEUP);

    // If intersected entity has changed since the cursorDown, still emit mouseUp on the
    // previously cursorUp entity.
    if (this.cursorDownEl && this.cursorDownEl !== this.intersectedEl) {
      this.cursorDownEl.emit(EVENTS.MOUSEUP, {cursorEl: this.el, intersection: null});
    }

    if (!this.data.fuse && this.intersectedEl && this.cursorDownEl === this.intersectedEl) {
      this.twoWayEmit(EVENTS.CLICK);
    }

    this.cursorDownEl = null;
    if (evt.type === 'touchend') { evt.preventDefault(); }
  },

  /**
   * Handle intersection.
   */
  onIntersection: function (evt) {
    var self = this;
    var cursorEl = this.el;
    var data = this.data;
    var index;
    var intersectedEl;
    var intersection;

    // Select closest object, excluding the cursor.
    index = evt.detail.els[0] === cursorEl ? 1 : 0;
    intersection = evt.detail.intersections[index];
    intersectedEl = evt.detail.els[index];

    // If cursor is the only intersected object, ignore the event.
    if (!intersectedEl) { return; }

    // Already intersecting this entity.
    if (this.intersectedEl === intersectedEl) {
      this.intersection = intersection;
      return;
    }

    // Unset current intersection.
    if (this.intersectedEl) { this.clearCurrentIntersection(); }

    // Set new intersection.
    this.intersection = intersection;
    this.intersectedEl = intersectedEl;

    // Hovering.
    self.twoWayEmit(EVENTS.MOUSEENTER);

    // Begin fuse if necessary.
    if (data.fuseTimeout === 0 || !data.fuse) { return; }
    this.twoWayEmit(EVENTS.FUSING);
    this.fuseTimeout = setTimeout(function fuse () {
      self.twoWayEmit(EVENTS.CLICK);
    }, data.fuseTimeout);
  },

  /**
   * Handle intersection cleared.
   */
  onIntersectionCleared: function (evt) {
    var clearedEls = evt.detail.clearedEls;

    // Check if the current intersection has ended
    if (clearedEls.indexOf(this.intersectedEl) !== -1) {
      this.clearCurrentIntersection();
    }
  },

  clearCurrentIntersection: function () {
    // No longer hovering (or fusing).
    this.twoWayEmit(EVENTS.MOUSELEAVE);

    // Unset intersected entity (after emitting the event).
    this.intersection = null;
    this.intersectedEl = null;

    // Clear fuseTimeout.
    clearTimeout(this.fuseTimeout);
  },

  /**
   * Helper to emit on both the cursor and the intersected entity (if exists).
   */
  twoWayEmit: function (evtName) {
    var el = this.el;
    var intersectedEl = this.intersectedEl;
    var intersection = this.intersection;
    el.emit(evtName, {intersectedEl: intersectedEl, intersection: intersection});
    if (!intersectedEl) { return; }
    intersectedEl.emit(evtName, {cursorEl: el, intersection: intersection});
  }
});
