var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

module.exports.Component = registerComponent('mouse-controls', {
  defaults: {
    value: {
      enabled: true
    }
  },

  init: {
    value: function () {
      var scene = this.el.sceneEl;
      this.setupControls();
      this.attachEventListeners();
      scene.addBehavior(this);
    }
  },

  attachEventListeners: {
    value: function () {
      var canvasEl = this.canvasEl;
      // Mouse Events
      canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), true);
      canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
      canvasEl.addEventListener('mouseup', this.releaseMouse.bind(this), true);
      canvasEl.addEventListener('mouseout', this.releaseMouse.bind(this), true);

      // Touch events
      canvasEl.addEventListener('touchstart', this.onTouchStart.bind(this));
      canvasEl.addEventListener('touchmove', this.onTouchMove.bind(this));
      canvasEl.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
  },

  setupControls: {
    value: function () {
      var object3D = this.el.object3D;
      // The canvas where the scene is painted
      this.canvasEl = document.querySelector('vr-scene').canvas;
      this.mouseDown = false;
      // To avoid gimbal lock
      object3D.rotation.order = 'YXZ';
      this.pitchObject = new THREE.Object3D();
      this.yawObject = new THREE.Object3D();
      this.yawObject.position.y = 10;
      this.yawObject.add(this.pitchObject);
    }
  },

  update: {
    value: function () {
      var el = this.el;
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var rotation;
      // Nothing to do if nothing has changed
      if (!this.dirty) { return; }
      rotation = el.getComputedAttribute('rotation');
      el.setAttribute('rotation', {
        x: rotation.x + THREE.Math.radToDeg(pitchObject.rotation.x),
        y: rotation.y + THREE.Math.radToDeg(yawObject.rotation.y),
        z: rotation.z
      });
      // Resets pitch and yaw
      pitchObject.rotation.set(0, 0, 0);
      yawObject.rotation.set(0, 0, 0);
      this.dirty = false;
    }
  },

  onMouseMove: {
    value: function (event) {
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;

      if (!this.mouseDown || !this.data.enabled) { return; }

      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      yawObject.rotation.y -= movementX * 0.002;
      pitchObject.rotation.x -= movementY * 0.002;
      pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
      this.dirty = true;
    }
  },

  onMouseDown: {
    value: function (event) {
      this.mouseDown = true;
    }
  },

  releaseMouse: {
    value: function () {
      this.mouseDown = false;
    }
  },

  onTouchStart: {
    value: function (e) {
      if (e.touches.length !== 1) { return; }
      this.touchStart = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
      this.touchStarted = true;
    }
  },

  onTouchMove: {
    value: function (e) {
      var deltaY;
      var yawObject = this.yawObject;
      if (!this.touchStarted) { return; }
      deltaY = 2 * Math.PI * (e.touches[0].pageX - this.touchStart.x) / this.canvasEl.clientWidth;
      // Limits touch orientaion to to yaw (y axis)
      yawObject.rotation.y -= deltaY * 0.5;
      this.touchStart = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      };
      this.dirty = true;
    }
  },

  onTouchEnd: {
    value: function () {
      this.touchStarted = false;
    }
  }

});
