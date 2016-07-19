var registerControls = require('../../core/controls').registerControls;
var THREE = require('../../lib/three');
var utils = require('../../utils');

var warn = utils.debug('components:mouse-controls:warn');

/**
 * Mouse-controls component.
 *
 * Updates rotation when dragging the mouse.
 */
module.exports.Component = registerControls('mouse-controls', {
  schema: {
    enabled: {default: true},
    sensitivity: {default: 0.002}
  },

  init: function () {
    this.mouseDown = false;
    this.lookVector = new THREE.Vector2();
    this.bindMethods();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.lookVector.set(0, 0);
  },

  remove: function () {
    this.pause();
  },

  bindMethods: function () {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  },

  addEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    if (!sceneEl) {
      // TODO: Mock the scene, or stub this component in unrelated tests.
      warn('Scene not defined during component initialization');
      return;
    }

    // listen for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('mousedown', this.onMouseDown, false);
    canvasEl.addEventListener('mousemove', this.onMouseMove, false);
    canvasEl.addEventListener('mouseup', this.onMouseUp, false);
    canvasEl.addEventListener('mouseout', this.onMouseUp, false);
  },

  removeEventListeners: function () {
    var canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (canvasEl) {
      canvasEl.removeEventListener('mousedown', this.onMouseDown, false);
      canvasEl.removeEventListener('mousemove', this.onMouseMove, false);
      canvasEl.removeEventListener('mouseup', this.onMouseUp, false);
      canvasEl.removeEventListener('mouseout', this.onMouseUp, false);
    }
  },

  isRotationActive: function () {
    return this.data.enabled && this.mouseDown;
  },

  /**
   * Returns the sum of all mouse movement since last call.
   */
  getRotationDelta: function () {
    var dRotation = this.lookVector.clone().multiplyScalar(this.data.sensitivity);
    this.lookVector.set(0, 0);
    return dRotation;
  },

  onMouseMove: function (event) {
    var lookVector = this.lookVector;
    var previousMouseEvent = this.previousMouseEvent;

    if (!this.data.enabled || !this.mouseDown) { return; }

    lookVector.x += event.screenX - previousMouseEvent.screenX;
    lookVector.y += event.screenY - previousMouseEvent.screenY;
    this.previousMouseEvent = event;
  },

  onMouseDown: function (event) {
    this.mouseDown = true;
    this.previousMouseEvent = event;
  },

  onMouseUp: function () {
    this.mouseDown = false;
  }
});
