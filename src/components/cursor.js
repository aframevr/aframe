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

var STATES = {
  FUSING: 'cursor-fusing',
  HOVERING: 'cursor-hovering',
  HOVERED: 'cursor-hovered'
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
    this.fuseTimeout = undefined;
    this.cursorDownEl = null;
    this.intersection = null;
    this.intersectedEl = null;

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
    var el = this.el;
    el.removeState(STATES.HOVERING);
    el.removeState(STATES.FUSING);
    clearTimeout(this.fuseTimeout);
    if (this.intersectedEl) { this.intersectedEl.removeState(STATES.HOVERED); }
    this.removeEventListeners();
  },

  addEventListeners: function () {
    var canvas;
    var data = this.data;
    var el = this.el;
    var self = this;

    canvas = el.sceneEl.canvas;
    if (canvas) {
      canvas.addEventListener('mousedown', this.onCursorDown);
      canvas.addEventListener('mouseup', this.onCursorUp);
    } else {
      el.sceneEl.addEventListener('render-target-loaded', function () {
        canvas = el.sceneEl.canvas;
        canvas.addEventListener('mousedown', self.onCursorDown);
        canvas.addEventListener('mouseup', self.onCursorUp);
      });
    }

    data.downEvents.forEach(function (downEvent) {
      el.addEventListener(downEvent, self.onCursorDown);
    });
    data.upEvents.forEach(function (upEvent) {
      el.addEventListener(upEvent, self.onCursorUp);
    });
    el.addEventListener('raycaster-intersection', this.onIntersection);
    el.addEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);
  },

  removeEventListeners: function () {
    var canvas;
    var data = this.data;
    var el = this.el;
    var self = this;

    canvas = el.sceneEl.canvas;
    if (canvas) {
      canvas.removeEventListener('mousedown', this.onCursorDown);
      canvas.removeEventListener('mouseup', this.onCursorUp);
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
  },

  updateMouseEventListeners: function () {
    var el = this.el;
    window.removeEventListener('mousemove', this.onMouseMove);
    el.setAttribute('raycaster', 'useWorldCoordinates', false);
    if (this.data.rayOrigin !== 'mouse') { return; }
    window.addEventListener('mousemove', this.onMouseMove, false);
    el.setAttribute('raycaster', 'useWorldCoordinates', true);
  },

  onMouseMove: (function () {
    var mouse = new THREE.Vector2();
    var origin = new THREE.Vector3();
    var direction = new THREE.Vector3();
    var rayCasterConfig = {
      origin: origin,
      direction: direction
    };
    return function (evt) {
      var camera = this.el.sceneEl.camera;
      camera.parent.updateMatrixWorld();
      camera.updateMatrixWorld();
      mouse.x = (evt.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(evt.clientY / window.innerHeight) * 2 + 1;
      origin.setFromMatrixPosition(camera.matrixWorld);
      direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(origin).normalize();
      this.el.setAttribute('raycaster', rayCasterConfig);
    };
  })(),

  /**
   * Trigger mousedown and keep track of the mousedowned entity.
   */
  onCursorDown: function (evt) {
    this.twoWayEmit(EVENTS.MOUSEDOWN);
    this.cursorDownEl = this.intersectedEl;
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
    cursorEl.addState(STATES.HOVERING);
    intersectedEl.addState(STATES.HOVERED);
    self.twoWayEmit(EVENTS.MOUSEENTER);

    // Begin fuse if necessary.
    if (data.fuseTimeout === 0 || !data.fuse) { return; }
    cursorEl.addState(STATES.FUSING);
    this.twoWayEmit(EVENTS.FUSING);
    this.fuseTimeout = setTimeout(function fuse () {
      cursorEl.removeState(STATES.FUSING);
      self.twoWayEmit(EVENTS.CLICK);
    }, data.fuseTimeout);
  },

  /**
   * Handle intersection cleared.
   */
  onIntersectionCleared: function (evt) {
    var cursorEl = this.el;
    var intersectedEl = evt.detail.el;

    // Ignore the cursor.
    if (cursorEl === intersectedEl) { return; }

    // Ignore if the event didn't occur on the current intersection.
    if (intersectedEl !== this.intersectedEl) { return; }

    this.clearCurrentIntersection();
  },

  clearCurrentIntersection: function () {
    var cursorEl = this.el;

    // No longer hovering (or fusing).
    this.intersectedEl.removeState(STATES.HOVERED);
    cursorEl.removeState(STATES.HOVERING);
    cursorEl.removeState(STATES.FUSING);
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
