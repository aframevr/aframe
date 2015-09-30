var registerComponent = require('../core/register-component');
var THREE = require('../../lib/three');

var defaults = {
  acceleration: 65
};

// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

module.exports.Component = registerComponent('controls', {
  setupControls: {
    value: function () {
      var scene = this.el.sceneEl;
      this.prevTime = Date.now();
      // The canvas where the scene is painted
      this.canvasEl = document.querySelector('vr-scene').canvas;

      // To keep track of the pressed keys
      this.keys = {};
      this.mouseDown = false;

      this.acceleration = defaults.acceleration;
      this.velocity = new THREE.Vector3();

      this.pitchObject = new THREE.Object3D();
      this.yawObject = new THREE.Object3D();
      this.yawObject.position.y = 10;
      this.yawObject.add(this.pitchObject);

      this.attachMouseKeyboardListeners();
      scene.addBehavior(this);
    }
  },

  update: {
    value: function () {
      if (!this.velocity) { this.setupControls(); }
      var velocity = this.velocity;
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var time = window.performance.now();
      var delta = (time - this.prevTime) / 1000;
      var keys = this.keys;
      var acceleration = this.acceleration;
      var movementVector;
      var el = this.el;
      this.prevTime = time;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      var position = el.getAttribute('position', {x: 0, y: 0, z: 0});
      var rotation = el.getAttribute('rotation', {x: 0, y: 0, z: 0});
      var rotZ = rotation.z;

      if (this.data.locomotion === 'true') {
        if (keys[65]) { // Left
          velocity.x -= acceleration * delta;
        }
        if (keys[87]) { // Up
          velocity.z -= acceleration * delta;
        }
        if (keys[68]) { // Right
          velocity.x += acceleration * delta;
        }
        if (keys[83]) { // Down
          velocity.z += acceleration * delta;
        }
      }

      if (keys[90]) { // Z
        this.reset();
      }

      movementVector = this.getMovementVector(delta);

      el.setAttribute('position', {
        x: position.x + movementVector.x,
        y: position.y,
        z: position.z + movementVector.z
      });

      el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(pitchObject.rotation.x),
        y: THREE.Math.radToDeg(yawObject.rotation.y),
        z: rotZ
      });
    }
  },

  attachMouseKeyboardListeners: {
    value: function () {
      var canvasEl = this.canvasEl;

      // Keyboard events
      window.addEventListener('keydown', this.onKeyDown.bind(this), false);
      window.addEventListener('keyup', this.onKeyUp.bind(this), false);

      // Mouse Events
      canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), true);
      canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this), true);
      canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
    }
  },

  onMouseMove: {
    value: function (event) {
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var mouseDown = this.mouseDown;
      var mouseLook = this.data.mouselook === 'true';

      if (!mouseDown || !mouseLook) { return; }

      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      yawObject.rotation.y -= movementX * 0.002;
      pitchObject.rotation.x -= movementY * 0.002;
      pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    }
  },

  onMouseDown: {
    value: function (event) {
      this.mouseDown = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  },

  onMouseUp: {
    value: function () {
      this.mouseDown = false;
    }
  },

  onKeyDown: {
    value: function (event) {
      this.keys[event.keyCode] = true;
    }
  },

  onKeyUp: {
    value: function (event) {
      this.keys[event.keyCode] = false;
    }
  },

  getMovementVector: {
    value: function (delta) {
      var velocity = this.velocity;
      var direction = new THREE.Vector3(velocity.x * delta, 0, velocity.z * delta);
      var rotation = new THREE.Euler(0, 0, 0, 'YXZ');
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);
      return direction.applyEuler(rotation);
    }
  }
});
