var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var isMobile = require('../utils/').device.isMobile();
var bind = require('../utils/bind');

var radToDeg = THREE.Math.radToDeg;

var GRABBING_CLASS = 'a-grabbing';
var PI_2 = Math.PI / 2;  // Calculate once.

/**
 * Update entity pose, factoring in mouse drag, touch drag, and HMD sensor data (VRControls).
 *
 * @member controls
 * @member dolly
 * @member euler
 * @member mouseDown
 * @member pitchObject
 * @member previousHMDPosition
 * @member previousMouseEvent
 * @member touchStart
 * @member touchStarted
 * @member yawObject
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
    this.setupMouseControls();
    this.setupHMDControls();
    this.bindMethods();

    // Enable grab cursor class on canvas.
    if (!sceneEl.canvas) {
      sceneEl.addEventListener('render-target-loaded', enableGrabCursor);
    } else {
      enableGrabCursor();
    }
    function enableGrabCursor () { sceneEl.canvas.classList.add('a-grab-cursor'); }
  },

  update: function (oldData) {
    var data = this.data;

    // Reset pitch and yaw if disabling HMD.
    if (oldData && !data.hmdEnabled && data.hmdEnabled !== oldData.hmdEnabled) {
      this.pitchObject.rotation.set(0, 0, 0);
      this.yawObject.rotation.set(0, 0, 0);
    }

    this.controls.standing = data.standing;
    this.updatePose();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  /**
   * Update pose on each frame.
   */
  tick: function (t) {
    this.updatePose();
  },

  remove: function () {
    this.removeEventListeners();
  },

  /**
   * Do actual update of rotation and position of entity.
   */
  updatePose: function () {
    if (!this.data.enabled) { return; }
    this.controls.update();
    this.updateOrientation();
    this.updatePosition();
  },

  bindMethods: function () {
    this.onMouseDown = bind(this.onMouseDown, this);
    this.onMouseMove = bind(this.onMouseMove, this);
    this.onMouseUp = bind(this.onMouseUp, this);
    this.onTouchStart = bind(this.onTouchStart, this);
    this.onTouchMove = bind(this.onTouchMove, this);
    this.onTouchEnd = bind(this.onTouchEnd, this);
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
   * Add mouse and touch event listeners.
   */
  addEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    // Listen for canvas to load.
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
   * Remove mouse and touch event listeners.
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
   * Update orientation for mobile, mouse look, and headset cases.
   * Mouse-drag only enabled if HMD is not active.
   */
  updateOrientation: (function () {
    var hmdEuler = new THREE.Euler();
    return function () {
      var currentRotation;
      var deltaRotation;
      var el = this.el;
      var hmdQuaternion;
      var pitchObject = this.pitchObject;
      var rotation;
      var sceneEl = el.sceneEl;
      var yawObject = this.yawObject;

      hmdQuaternion = this.calculateHMDQuaternion();
      hmdEuler.setFromQuaternion(hmdQuaternion, 'YXZ');

      if (isMobile) {
        // In mobile, allow camera rotation with touch events and sensors.
        rotation = {
          x: radToDeg(hmdEuler.x) + radToDeg(pitchObject.rotation.x),
          y: radToDeg(hmdEuler.y) + radToDeg(yawObject.rotation.y),
          z: radToDeg(hmdEuler.z)
        };
      } else if (!sceneEl.is('vr-mode') || isNullVector(hmdEuler) || !this.data.hmdEnabled) {
        // Mouse-drag only if HMD is not active (disabled, no incoming sensor data).
        currentRotation = el.getAttribute('rotation');
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
        // HMD. Mouse rotation ignored with active headset, user head rotation takes priority.
        rotation = {
          x: radToDeg(hmdEuler.x),
          y: radToDeg(hmdEuler.y),
          z: radToDeg(hmdEuler.z)
        };
      }

      el.setAttribute('rotation', rotation);
    };
  })(),

  /**
   * Calculate change in rotation by subtracting previous rotation from current rotation.
   *
   * @member previousRotationX
   * @member previousRotationY
   */
  calculateDeltaRotation: (function () {
    var previousRotationX;
    var previousRotationY;
    return function () {
      var currentRotationX = radToDeg(this.pitchObject.rotation.x);
      var currentRotationY = radToDeg(this.yawObject.rotation.y);
      var deltaRotation;

      previousRotationX = previousRotationX || currentRotationX;
      previousRotationY = previousRotationY || currentRotationY;

      deltaRotation = {
        x: currentRotationX - previousRotationX,
        y: currentRotationY - previousRotationY
      };

      // Store current rotation for next tick.
      previousRotationX = currentRotationX;
      previousRotationY = currentRotationY;
      return deltaRotation;
    };
  })(),

  /**
   * Grab HMD rotation from the dolly which receives data from VRControls.
   */
  calculateHMDQuaternion: (function () {
    var hmdQuaternion = new THREE.Quaternion();
    return function () {
      hmdQuaternion.copy(this.dolly.quaternion);
      return hmdQuaternion;
    };
  })(),

  /**
   * Handle positional tracking for HMDs.
   *
   * @member deltaHMDPosition
   */
  updatePosition: (function () {
    var deltaHMDPosition = new THREE.Vector3();
    return function () {
      var el = this.el;
      var currentPosition;
      var currentHMDPosition;
      var previousHMDPosition = this.previousHMDPosition;
      var sceneEl = el.sceneEl;

      // Not in VR mode.
      if (!sceneEl.is('vr-mode')) { return; }

      // Calculate change in position.
      currentHMDPosition = this.calculateHMDPosition();
      deltaHMDPosition.copy(currentHMDPosition).sub(previousHMDPosition);

      // Has not moved.
      if (isNullVector(deltaHMDPosition)) { return; }

      previousHMDPosition.copy(currentHMDPosition);

      // Set final position by adding change in position to current position.
      currentPosition = el.getAttribute('position');
      el.setAttribute('position', {
        x: currentPosition.x + deltaHMDPosition.x,
        y: currentPosition.y + deltaHMDPosition.y,
        z: currentPosition.z + deltaHMDPosition.z
      });
    };
  })(),

  /**
   * Get HMD position from VRControls.
   */
  calculateHMDPosition: function () {
    var dolly = this.dolly;
    var position = new THREE.Vector3();
    dolly.updateMatrix();
    position.setFromMatrixPosition(dolly.matrix);
    return position;
  },

  /**
   * Translate mouse drag into rotation.
   */
  onMouseMove: function (event) {
    var movementX;
    var movementY;
    var pitchObject = this.pitchObject;
    var previousMouseEvent = this.previousMouseEvent;
    var yawObject = this.yawObject;

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
  onMouseDown: function (event) {
    this.mouseDown = true;
    this.previousMouseEvent = event;
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
  onTouchStart: function (event) {
    if (event.touches.length !== 1) { return; }
    this.touchStart = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY
    };
    this.touchStarted = true;
  },

  /**
   * Translate touch move to Y-axis rotation.
   */
  onTouchMove: function (event) {
    var canvas = this.sceneEl.canvas;
    var deltaY;
    var yawObject = this.yawObject;

    if (!this.touchStarted) { return; }

    // Limit touch orientaion to to yaw (Y-axis).
    deltaY = 2 * Math.PI * (event.touches[0].pageX - this.touchStart.x) / canvas.clientWidth;
    yawObject.rotation.y -= deltaY * 0.5;
    this.touchStart = {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY
    };
  },

  /**
   * Register touch end to detect release of touch drag.
   */
  onTouchEnd: function () {
    this.touchStarted = false;
  }
});

function isNullVector (vector) {
  return vector.x === 0 && vector.y === 0 && vector.z === 0;
}
