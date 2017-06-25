var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var bind = require('../utils/bind');

// To avoid recalculation at every mouse movement tick
var GRABBING_CLASS = 'a-grabbing';
var PI_2 = Math.PI / 2;
var radToDeg = THREE.Math.radToDeg;

/**
 * look-controls. Update entity pose, factoring mouse, touch, and WebVR API data.
 */
module.exports.Component = registerComponent('look-controls', {
  dependencies: ['position', 'rotation'],

  schema: {
    enabled: {default: true},
    hmdEnabled: {default: true},
    reverseMouseDrag: {default: false},
    standing: {default: true}
  },

  init: function () {
    var sceneEl = this.el.sceneEl;

    this.previousHMDPosition = new THREE.Vector3();
    this.hmdQuaternion = new THREE.Quaternion();
    this.hmdEuler = new THREE.Euler();

    this.setupMouseControls();
    this.setupHMDControls();
    this.bindMethods();

    // Reset previous HMD position when we exit VR.
    sceneEl.addEventListener('exit-vr', this.onExitVR);
  },

  update: function (oldData) {
    var data = this.data;

    // Disable grab cursor classes if no longer enabled.
    if (data.enabled !== oldData.enabled) {
      this.updateGrabCursor(data.enabled);
    }

    // Reset pitch and yaw if disabling HMD.
    if (oldData && !data.hmdEnabled && !oldData.hmdEnabled) {
      this.pitchObject.rotation.set(0, 0, 0);
      this.yawObject.rotation.set(0, 0, 0);
    }
  },

  tick: function (t) {
    var data = this.data;
    if (!data.enabled) { return; }
    this.controls.standing = data.standing;
    this.controls.update();
    this.updateOrientation();
    this.updatePosition();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  remove: function () {
    this.removeEventListeners();
  },

  bindMethods: function () {
    this.onMouseDown = bind(this.onMouseDown, this);
    this.onMouseMove = bind(this.onMouseMove, this);
    this.onMouseUp = bind(this.onMouseUp, this);
    this.onTouchStart = bind(this.onTouchStart, this);
    this.onTouchMove = bind(this.onTouchMove, this);
    this.onTouchEnd = bind(this.onTouchEnd, this);
    this.onExitVR = bind(this.onExitVR, this);
  },

 /**
  * Set up states and Object3Ds needed to store rotation data.
  */
  setupMouseControls: function () {
    this.mouseDown = false;
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 10;
    this.yawObject.add(this.pitchObject);
  },

  /**
   * Set up VR controls that will copy data to the dolly.
   */
  setupHMDControls: function () {
    this.dolly = new THREE.Object3D();
    this.euler = new THREE.Euler();
    this.controls = new THREE.VRControls(this.dolly);
    this.controls.userHeight = 0.0;
  },

  /**
   * Add mouse and touch event listeners to canvas.
   */
  addEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    // Wait for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', bind(this.addEventListeners, this));
      return;
    }

    // Mouse events.
    canvasEl.addEventListener('mousedown', this.onMouseDown, false);
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener('mouseup', this.onMouseUp, false);

    // Touch events.
    canvasEl.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchmove', this.onTouchMove);
    window.addEventListener('touchend', this.onTouchEnd);
  },

  /**
   * Remove mouse and touch event listeners from canvas.
   */
  removeEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl && sceneEl.canvas;

    if (!canvasEl) { return; }

    // Mouse events.
    canvasEl.removeEventListener('mousedown', this.onMouseDown);
    canvasEl.removeEventListener('mousemove', this.onMouseMove);
    canvasEl.removeEventListener('mouseup', this.onMouseUp);
    canvasEl.removeEventListener('mouseout', this.onMouseUp);

    // Touch events.
    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchmove', this.onTouchMove);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
  },

  /**
   * Update orientation for mobile, mouse drag, and headset.
   * Mouse-drag only enabled if HMD is not active.
   */
  updateOrientation: function () {
    var currentRotation;
    var deltaRotation;
    var hmdEuler = this.hmdEuler;
    var hmdQuaternion = this.hmdQuaternion;
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;
    var sceneEl = this.el.sceneEl;
    var rotation;

    // Calculate HMD quaternion.
    hmdQuaternion = hmdQuaternion.copy(this.dolly.quaternion);
    hmdEuler.setFromQuaternion(hmdQuaternion, 'YXZ');

    if (sceneEl.isMobile) {
      // On mobile, do camera rotation with touch events and sensors.
      rotation = {
        x: radToDeg(hmdEuler.x) + radToDeg(pitchObject.rotation.x),
        y: radToDeg(hmdEuler.y) + radToDeg(yawObject.rotation.y),
        z: radToDeg(hmdEuler.z)
      };
    } else if (!sceneEl.is('vr-mode') || isNullVector(hmdEuler) || !this.data.hmdEnabled) {
      // Mouse drag if WebVR not active (not connected, no incoming sensor data).
      currentRotation = this.el.getAttribute('rotation');
      deltaRotation = this.calculateDeltaRotation();
      if (this.data.reverseMouseDrag) {
        rotation = {
          x: currentRotation.x - deltaRotation.x,
          y: currentRotation.y - deltaRotation.y,
          z: currentRotation.z
        };
      } else {
        rotation = {
          x: currentRotation.x + deltaRotation.x,
          y: currentRotation.y + deltaRotation.y,
          z: currentRotation.z
        };
      }
    } else {
      // Mouse rotation ignored with an active headset. Use headset rotation.
      rotation = {
        x: radToDeg(hmdEuler.x),
        y: radToDeg(hmdEuler.y),
        z: radToDeg(hmdEuler.z)
      };
    }

    this.el.setAttribute('rotation', rotation);
  },

  /**
   * Calculate delta rotation for mouse-drag and touch-drag.
   */
  calculateDeltaRotation: function () {
    var currentRotationX = radToDeg(this.pitchObject.rotation.x);
    var currentRotationY = radToDeg(this.yawObject.rotation.y);
    var deltaRotation;
    deltaRotation = {
      x: currentRotationX - (this.previousRotationX || 0),
      y: currentRotationY - (this.previousRotationY || 0)
    };
    // Store current rotation for next tick.
    this.previousRotationX = currentRotationX;
    this.previousRotationY = currentRotationY;
    return deltaRotation;
  },

  /**
   * Handle positional tracking.
   */
  updatePosition: (function () {
    var deltaHMDPosition = new THREE.Vector3();

    return function () {
      var el = this.el;
      var currentPosition = el.getAttribute('position');
      var currentHMDPosition;
      var previousHMDPosition = this.previousHMDPosition;
      var sceneEl = this.el.sceneEl;

      if (!sceneEl.is('vr-mode')) { return; }

      // Calculate change in position.
      currentHMDPosition = this.calculateHMDPosition();
      deltaHMDPosition.copy(currentHMDPosition).sub(previousHMDPosition);

      if (isNullVector(deltaHMDPosition)) { return; }

      previousHMDPosition.copy(currentHMDPosition);

      el.setAttribute('position', {
        x: currentPosition.x + deltaHMDPosition.x,
        y: currentPosition.y + deltaHMDPosition.y,
        z: currentPosition.z + deltaHMDPosition.z
      });
    };
  })(),

  /**
   * Get headset position from VRControls.
   */
  calculateHMDPosition: (function () {
    var position = new THREE.Vector3();
    return function () {
      this.dolly.updateMatrix();
      position.setFromMatrixPosition(this.dolly.matrix);
      return position;
    };
  })(),

  /**
   * Translate mouse drag into rotation.
   *
   * Dragging up and down rotates the camera around the X-axis (yaw).
   * Dragging left and right rotates the camera around the Y-axis (pitch).
   */
  onMouseMove: function (event) {
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;
    var previousMouseEvent = this.previousMouseEvent;
    var movementX;
    var movementY;

    // Not dragging or not enabled.
    if (!this.mouseDown || !this.data.enabled) { return; }

     // Calculate delta.
    movementX = event.movementX || event.mozMovementX;
    movementY = event.movementY || event.mozMovementY;
    if (movementX === undefined || movementY === undefined) {
      movementX = event.screenX - previousMouseEvent.screenX;
      movementY = event.screenY - previousMouseEvent.screenY;
    }
    this.previousMouseEvent = event;

    // Calculate rotation.
    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  },

  /**
   * Register mouse down to detect mouse drag.
   */
  onMouseDown: function (evt) {
    if (!this.data.enabled) { return; }
    // Handle only primary button.
    if (evt.button !== 0) { return; }
    this.mouseDown = true;
    this.previousMouseEvent = evt;
    document.body.classList.add(GRABBING_CLASS);
  },

  /**
   * Register mouse up to detect release of mouse drag.
   */
  onMouseUp: function () {
    this.mouseDown = false;
    document.body.classList.remove(GRABBING_CLASS);
  },

  /**
   * Register touch down to detect touch drag.
   */
  onTouchStart: function (evt) {
    if (evt.touches.length !== 1) { return; }
    this.touchStart = {
      x: evt.touches[0].pageX,
      y: evt.touches[0].pageY
    };
    this.touchStarted = true;
  },

  /**
   * Translate touch move to Y-axis rotation.
   */
  onTouchMove: function (evt) {
    var canvas = this.el.sceneEl.canvas;
    var deltaY;
    var yawObject = this.yawObject;

    if (!this.touchStarted) { return; }

    deltaY = 2 * Math.PI * (evt.touches[0].pageX - this.touchStart.x) / canvas.clientWidth;

    // Limit touch orientaion to to yaw (y axis).
    yawObject.rotation.y -= deltaY * 0.5;
    this.touchStart = {
      x: evt.touches[0].pageX,
      y: evt.touches[0].pageY
    };
  },

  /**
   * Register touch end to detect release of touch drag.
   */
  onTouchEnd: function () {
    this.touchStarted = false;
  },

  onExitVR: function () {
    this.previousHMDPosition.set(0, 0, 0);
  },

  /**
   * Toggle the feature of showing/hiding the grab cursor.
   */
  updateGrabCursor: function (enabled) {
    var sceneEl = this.el.sceneEl;

    function enableGrabCursor () { sceneEl.canvas.classList.add('a-grab-cursor'); }
    function disableGrabCursor () { sceneEl.canvas.classList.remove('a-grab-cursor'); }

    if (!sceneEl.canvas) {
      if (enabled) {
        sceneEl.addEventListener('render-target-loaded', enableGrabCursor);
      } else {
        sceneEl.addEventListener('render-target-loaded', disableGrabCursor);
      }
      return;
    }

    if (enabled) {
      enableGrabCursor();
      return;
    }
    disableGrabCursor();
  }
});

function isNullVector (vector) {
  return vector.x === 0 && vector.y === 0 && vector.z === 0;
}
