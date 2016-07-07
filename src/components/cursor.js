var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

var EVENTS = {
  CLICK: 'click',
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
 * @member {Element} mouseDownEl - Entity that was last mousedowned during current click.
 * @member {Element} intersectedEl - Currently-intersected entity. Used to keep track to
 *         emit events when unintersecting.
 */
module.exports.Component = registerComponent('cursor', {
  dependencies: ['raycaster'],

  schema: {
    fuse: {default: utils.isMobile()},
    fuseTimeout: {default: 1500, min: 0}
  },

  init: function () {
    var cursorEl = this.el;
    var canvas = cursorEl.sceneEl.canvas;
    this.fuseTimeout = undefined;
    this.mouseDownEl = null;
    this.intersectedEl = null;

    // Wait for canvas to load.
    if (!canvas) {
      cursorEl.sceneEl.addEventListener('render-target-loaded', this.init.bind(this));
      return;
    }

    // Attach event listeners.
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    cursorEl.addEventListener('raycaster-intersection', this.onIntersection.bind(this));
    cursorEl.addEventListener('raycaster-intersection-cleared',
                              this.onIntersectionCleared.bind(this));
  },

  /**
   * Trigger mousedown and keep track of the mousedowned entity.
   */
  onMouseDown: function (evt) {
    this.twoWayEmit(EVENTS.MOUSEDOWN);
    this.mouseDownEl = this.intersectedEl;
  },

  /**
   * Trigger mouseup if:
   * - Not fusing (mobile has no mouse).
   * - Currently intersecting an entity.
   * - Currently-intersected entity is the same as the one when mousedown was triggered,
   *   in case user mousedowned one entity, dragged to another, and mouseupped.
   */
  onMouseUp: function () {
    this.twoWayEmit(EVENTS.MOUSEUP);
    if (this.data.fuse || !this.intersectedEl ||
        this.mouseDownEl !== this.intersectedEl) { return; }
    this.twoWayEmit(EVENTS.CLICK);
  },

  /**
   * Handle intersection.
   */
  onIntersection: function (evt) {
    var self = this;
    var cursorEl = this.el;
    var data = this.data;
    var intersectedEl = evt.detail.els[0];  // Grab the closest.

    // Set intersected entity if not already intersecting.
    if (this.intersectedEl === intersectedEl) { return; }
    this.intersectedEl = intersectedEl;

    // Hovering.
    cursorEl.addState(STATES.HOVERING);
    intersectedEl.addState(STATES.HOVERED);
    self.twoWayEmit(EVENTS.MOUSEENTER);

    // Begin fuse if necessary.
    if (data.fuseTimeout === 0 || !data.fuse) { return; }
    cursorEl.addState(STATES.FUSING);
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

    // Not intersecting.
    if (!intersectedEl || !this.intersectedEl) { return; }

    // No longer hovering (or fusing).
    intersectedEl.removeState(STATES.HOVERED);
    cursorEl.removeState(STATES.HOVERING);
    cursorEl.removeState(STATES.FUSING);
    this.twoWayEmit(EVENTS.MOUSELEAVE);

    // Unset intersected entity (after emitting the event).
    this.intersectedEl = null;

    // Clear fuseTimeout.
    clearTimeout(this.fuseTimeout);
  },

  /**
   * Helper to emit on both the cursor and the intersected entity (if exists).
   */
  twoWayEmit: function (evtName) {
    var intersectedEl = this.intersectedEl;
    this.el.emit(evtName, {intersectedEl: this.intersectedEl});
    if (!intersectedEl) { return; }
    intersectedEl.emit(evtName, {cursorEl: this.el});
  }
});
