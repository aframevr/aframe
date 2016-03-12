var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

module.exports.Component = registerComponent('look-controls', {
  dependencies: ['position', 'rotation'],

  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.previousPosition = new THREE.Vector3();
    this.deltaPosition = new THREE.Vector3();
    this.setupMouseControls();
    this.setupHMDControls();
    this.bindMethods();
  },

  update: function () {
    if (!this.data.enabled) { return; }
    this.controls.update();
    this.updateOrientation();
    this.updatePosition();
  },

  play: function () {
    this.previousPosition.set(0, 0, 0);
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  tick: function (t) {
    this.update();
  },

  remove: function () {
    this.pause();
  },

  bindMethods: function () {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.releaseMouse = this.releaseMouse.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  },

  setupMouseControls: function () {
    // The canvas where the scene is painted
    this.mouseDown = false;
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 10;
    this.yawObject.add(this.pitchObject);
  },

  setupHMDControls: function () {
    this.dolly = new THREE.Object3D();
    this.euler = new THREE.Euler();
    this.controls = new THREE.VRControls(this.dolly);
    this.zeroQuaternion = new THREE.Quaternion();
  },

  addEventListeners: function () {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    // listen for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    // Mouse Events
    canvasEl.addEventListener('mousedown', this.onMouseDown, false);
    canvasEl.addEventListener('mousemove', this.onMouseMove, false);
    canvasEl.addEventListener('mouseup', this.releaseMouse, false);
    canvasEl.addEventListener('mouseout', this.releaseMouse, false);

    // Touch events
    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchmove', this.onTouchMove);
    canvasEl.addEventListener('touchend', this.onTouchEnd);
  },

  removeEventListeners: function () {
    var sceneEl = document.querySelector('a-scene');
    var canvasEl = sceneEl && sceneEl.canvas;
    if (!canvasEl) { return; }

    // Mouse Events
    canvasEl.removeEventListener('mousedown', this.onMouseDown);
    canvasEl.removeEventListener('mousemove', this.onMouseMove);
    canvasEl.removeEventListener('mouseup', this.releaseMouse);
    canvasEl.removeEventListener('mouseout', this.releaseMouse);

    // Touch events
    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchmove', this.onTouchMove);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
  },

  updateOrientation: (function () {
    var hmdEuler = new THREE.Euler();
    hmdEuler.order = 'YXZ';
    return function () {
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var hmdQuaternion = this.calculateHMDQuaternion();
      hmdEuler.setFromQuaternion(hmdQuaternion);
      this.el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(hmdEuler.x) + THREE.Math.radToDeg(pitchObject.rotation.x),
        y: THREE.Math.radToDeg(hmdEuler.y) + THREE.Math.radToDeg(yawObject.rotation.y),
        z: THREE.Math.radToDeg(hmdEuler.z)
      });
    };
  })(),

  calculateHMDQuaternion: (function () {
    var hmdQuaternion = new THREE.Quaternion();
    return function () {
      var dolly = this.dolly;
      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
        this.zeroOrientation();
        this.zeroed = true;
      }
      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
      return hmdQuaternion;
    };
  })(),

  updatePosition: function () {
    var el = this.el;
    var deltaPosition = this.calculateDeltaPosition();
    var currentPosition = el.getComputedAttribute('position');
    el.setAttribute('position', {
      x: currentPosition.x + deltaPosition.x,
      y: currentPosition.y + deltaPosition.y,
      z: currentPosition.z + deltaPosition.z
    });
  },

  calculateDeltaPosition: function () {
    var dolly = this.dolly;
    var deltaPosition = this.deltaPosition;
    var previousPosition = this.previousPosition;
    deltaPosition.copy(dolly.position);
    deltaPosition.sub(previousPosition);
    previousPosition.copy(dolly.position);
    return deltaPosition;
  },

  updateHMDQuaternion: (function () {
    var hmdQuaternion = new THREE.Quaternion();
    return function () {
      var dolly = this.dolly;
      this.controls.update();
      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
        this.zeroOrientation();
        this.zeroed = true;
      }
      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
      return hmdQuaternion;
    };
  })(),

  zeroOrientation: function () {
    var euler = new THREE.Euler();
    euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
    // Cancel out roll and pitch. We want to only reset yaw
    euler.z = 0;
    euler.x = 0;
    this.zeroQuaternion.setFromEuler(euler);
  },

  onMouseMove: function (event) {
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;
    var previousMouseEvent = this.previousMouseEvent;

    if (!this.mouseDown || !this.data.enabled) { return; }

    var movementX = event.movementX || event.mozMovementX;
    var movementY = event.movementY || event.mozMovementY;

    if (movementX === undefined || movementY === undefined) {
      movementX = event.screenX - previousMouseEvent.screenX;
      movementY = event.screenY - previousMouseEvent.screenY;
    }
    this.previousMouseEvent = event;

    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  },

  onMouseDown: function (event) {
    this.mouseDown = true;
    this.previousMouseEvent = event;
  },

  releaseMouse: function () {
    this.mouseDown = false;
  },

  onTouchStart: function (e) {
    if (e.touches.length !== 1) { return; }
    this.touchStart = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };
    this.touchStarted = true;
  },

  onTouchMove: function (e) {
    var deltaY;
    var yawObject = this.yawObject;
    if (!this.touchStarted) { return; }
    deltaY = 2 * Math.PI * (e.touches[0].pageX - this.touchStart.x) /
            this.el.sceneEl.canvas.clientWidth;
    // Limits touch orientaion to to yaw (y axis)
    yawObject.rotation.y -= deltaY * 0.5;
    this.touchStart = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };
  },

  onTouchEnd: function () {
    this.touchStarted = false;
  }
});
