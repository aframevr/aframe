var registerComponent = require('../../core/component').registerComponent;
var THREE = require('../../lib/three');

/**
 * Mouse-controls component.
 *
 * Updates rotation with mousedrag or pointerlock input.
 */
module.exports.Component = registerComponent('mouse-controls', {
  schema: {
    enabled: { default: true },
    pointerlockEnabled: { default: false },
    sensitivity: { default: 1 / 25 }
  },

  init: function () {
    this.mouseDown = false;
    this.pointerLocked = false;
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
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
  },

  addEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;
    var data = this.data;

    // listen for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('mousedown', this.onMouseDown, false);
    canvasEl.addEventListener('mousemove', this.onMouseMove, false);
    canvasEl.addEventListener('mouseup', this.onMouseUp, false);
    canvasEl.addEventListener('mouseout', this.onMouseUp, false);

    if (data.pointerlockEnabled) {
      document.addEventListener('pointerlockchange', this.onPointerLockChange, false);
      document.addEventListener('mozpointerlockchange', this.onPointerLockChange, false);
      document.addEventListener('pointerlockerror', this.onPointerLockError, false);
    }
  },

  removeEventListeners: function () {
    var canvasEl = this.el.sceneEl && this.sceneEl.canvas;
    if (canvasEl) {
      canvasEl.removeEventListener('mousedown', this.onMouseDown, false);
      canvasEl.removeEventListener('mousemove', this.onMouseMove, false);
      canvasEl.removeEventListener('mouseup', this.onMouseUp, false);
      canvasEl.removeEventListener('mouseout', this.onMouseUp, false);
    }
    document.removeEventListener('pointerlockchange', this.onPointerLockChange, false);
    document.removeEventListener('mozpointerlockchange', this.onPointerLockChange, false);
    document.removeEventListener('pointerlockerror', this.onPointerLockError, false);
  },

  isRotationActive: function () {
    return this.data.enabled && (this.mouseDown || this.pointerLocked);
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
    var previousMouseEvent = this.previousMouseEvent;

    if (!this.data.enabled || !(this.mouseDown || this.pointerLocked)) {
      return;
    }

    var movementX = event.movementX || event.mozMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || 0;

    if (!this.pointerLocked) {
      movementX = event.screenX - previousMouseEvent.screenX;
      movementY = event.screenY - previousMouseEvent.screenY;
    }

    this.lookVector.x += movementX;
    this.lookVector.y += movementY;

    this.previousMouseEvent = event;
  },

  onMouseDown: function (event) {
    var canvasEl = this.el.sceneEl.canvas;

    this.mouseDown = true;
    this.previousMouseEvent = event;

    if (this.data.pointerlockEnabled && !this.pointerLocked) {
      if (canvasEl.requestPointerLock) {
        canvasEl.requestPointerLock();
      } else if (canvasEl.mozRequestPointerLock) {
        canvasEl.mozRequestPointerLock();
      }
    }
  },

  onMouseUp: function () {
    this.mouseDown = false;
  },

  onPointerLockChange: function () {
    this.pointerLocked = !!(document.pointerLockElement || document.mozPointerLockElement);
  },

  onPointerLockError: function () {
    this.pointerLocked = false;
  }
});
