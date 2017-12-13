var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');
var bind = utils.bind;
var PolyfillControls = require('../utils').device.PolyfillControls;

// To avoid recalculation at every mouse movement tick
var GRABBING_CLASS = 'a-grabbing';
var PI_2 = Math.PI / 2;
var radToDeg = THREE.Math.radToDeg;

var checkHasPositionalTracking = utils.device.checkHasPositionalTracking;

/**
 * look-controls. Update entity pose, factoring mouse, touch, and WebVR API data.
 */
module.exports.Component = registerComponent('look-controls', {
  dependencies: ['position', 'rotation'],

  schema: {
    enabled: {default: true},
    touchEnabled: {default: true},
    hmdEnabled: {default: true},
    reverseMouseDrag: {default: false},
    userHeight: {default: 1.6}
  },

  init: function () {
    this.previousHMDPosition = new THREE.Vector3();
    this.hmdQuaternion = new THREE.Quaternion();
    this.hmdEuler = new THREE.Euler();
    this.position = new THREE.Vector3();
    // To save / restore camera pose
    this.savedRotation = new THREE.Vector3();
    this.savedPosition = new THREE.Vector3();
    this.polyfillObject = new THREE.Object3D();
    this.polyfillControls = new PolyfillControls(this.polyfillObject);
    this.rotation = {};
    this.deltaRotation = {};
    this.savedPose = null;
    this.setupMouseControls();
    this.bindMethods();

    // Call enter VR handler if the scene has entered VR before the event listeners attached.
    if (this.el.sceneEl.is('vr-mode')) { this.onEnterVR(); }
  },

  update: function (oldData) {
    var data = this.data;

    // Update height offset.
    this.addHeightOffset(oldData.userHeight);

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
    this.updatePosition();
    this.updateOrientation();
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
    this.onEnterVR = bind(this.onEnterVR, this);
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

    // sceneEl events.
    sceneEl.addEventListener('enter-vr', this.onEnterVR);
    sceneEl.addEventListener('exit-vr', this.onExitVR);
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

    // sceneEl events.
    sceneEl.removeEventListener('enter-vr', this.onEnterVR);
    sceneEl.removeEventListener('exit-vr', this.onExitVR);
  },

  /**
   * Update orientation for mobile, mouse drag, and headset.
   * Mouse-drag only enabled if HMD is not active.
   */
  updateOrientation: function () {
    var hmdEuler = this.hmdEuler;
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;
    var sceneEl = this.el.sceneEl;
    var rotation = this.rotation;

    // In VR mode, THREE is in charge of updating the camera rotation.
    if (sceneEl.is('vr-mode') && sceneEl.checkHeadsetConnected()) { return; }

    // Calculate polyfilled HMD quaternion.
    this.polyfillControls.update();
    hmdEuler.setFromQuaternion(this.polyfillObject.quaternion, 'YXZ');
    // On mobile, do camera rotation with touch events and sensors.
    rotation.x = radToDeg(hmdEuler.x) + radToDeg(pitchObject.rotation.x);
    rotation.y = radToDeg(hmdEuler.y) + radToDeg(yawObject.rotation.y);
    rotation.z = 0;

    this.el.setAttribute('rotation', rotation);
  },

  /**
   * Handle positional tracking.
   */
  updatePosition: function () {
    var el = this.el;
    var currentHMDPosition;
    var currentPosition;
    var position = this.position;
    var previousHMDPosition = this.previousHMDPosition;
    var sceneEl = this.el.sceneEl;

    if (!sceneEl.is('vr-mode') || !sceneEl.checkHeadsetConnected()) { return; }

    // Calculate change in position.
    currentHMDPosition = this.calculateHMDPosition();
    currentPosition = el.getAttribute('position');

    position.copy(currentPosition).sub(previousHMDPosition).add(currentHMDPosition);
    el.setAttribute('position', position);
    previousHMDPosition.copy(currentHMDPosition);
  },

  calculateHMDPosition: (function () {
    var position = new THREE.Vector3();
    return function () {
      var object3D = this.el.object3D;
      object3D.updateMatrix();
      position.setFromMatrixPosition(object3D.matrix);
      return position;
    };
  })(),

  /**
   * Calculate delta rotation for mouse-drag and touch-drag.
   */
  calculateDeltaRotation: function () {
    var currentRotationX = radToDeg(this.pitchObject.rotation.x);
    var currentRotationY = radToDeg(this.yawObject.rotation.y);
    this.deltaRotation.x = currentRotationX - (this.previousRotationX || 0);
    this.deltaRotation.y = currentRotationY - (this.previousRotationY || 0);
    // Store current rotation for next tick.
    this.previousRotationX = currentRotationX;
    this.previousRotationY = currentRotationY;
    return this.deltaRotation;
  },

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
    if (evt.touches.length !== 1 || !this.data.touchEnabled) { return; }
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

    if (!this.touchStarted || !this.data.touchEnabled) { return; }

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

  /**
   * Save pose.
   */
  onEnterVR: function () {
    this.saveCameraPose();
    this.removeHeightOffset();
  },

  /**
   * Restore the pose.
   */
  onExitVR: function () {
    this.restoreCameraPose();
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
  },

  /**
   * Offsets the position of the camera to set a human scale perspective
   * This offset is not necessary when using a headset because the SDK
   * will return the real user's head height and position.
   */
  addHeightOffset: function (oldOffset) {
    var el = this.el;
    var currentPosition;
    var userHeightOffset = this.data.userHeight;

    oldOffset = oldOffset || 0;
    currentPosition = el.getAttribute('position') || {x: 0, y: 0, z: 0};
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y - oldOffset + userHeightOffset,
      z: currentPosition.z
    });
  },

  /**
   * Remove the height offset (called when entering VR) since WebVR API gives absolute
   * position.
   */
  removeHeightOffset: function () {
    var currentPosition;
    var el = this.el;
    var hasPositionalTracking;
    var userHeightOffset = this.data.userHeight;

    // Remove the offset if there is positional tracking when entering VR.
    // Necessary for fullscreen mode with no headset.
    // Checking this.hasPositionalTracking to make the value injectable for unit tests.
    hasPositionalTracking = this.hasPositionalTracking !== undefined
      ? this.hasPositionalTracking
      : checkHasPositionalTracking();

    if (!userHeightOffset || !hasPositionalTracking) { return; }

    currentPosition = el.getAttribute('position') || {x: 0, y: 0, z: 0};
    el.setAttribute('position', {
      x: currentPosition.x,
      y: currentPosition.y - userHeightOffset,
      z: currentPosition.z
    });
  },

  /**
   * Save camera pose before entering VR to restore later if exiting.
   */
  saveCameraPose: function () {
    var el = this.el;
    var position = el.getAttribute('position');
    var rotation = el.getAttribute('rotation');
    var hasPositionalTracking = this.hasPositionalTracking !== undefined ? this.hasPositionalTracking : checkHasPositionalTracking();

    if (this.savedPose || !hasPositionalTracking) { return; }
    this.savedPose = {
      position: this.savedPosition.copy(position),
      rotation: this.savedRotation.copy(rotation)
    };
  },

  /**
   * Reset camera pose to before entering VR.
   */
  restoreCameraPose: function () {
    var el = this.el;
    var savedPose = this.savedPose;
    var hasPositionalTracking = this.hasPositionalTracking !== undefined ? this.hasPositionalTracking : checkHasPositionalTracking();

    if (!savedPose || !hasPositionalTracking) { return; }

    // Reset camera orientation.
    el.setAttribute('position', savedPose.position);
    el.setAttribute('rotation', savedPose.rotation);
    this.savedPose = null;
  }
});
