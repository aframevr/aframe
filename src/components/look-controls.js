var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

module.exports.Component = registerComponent('look-controls', {
  defaults: {
    value: {
      enabled: true
    }
  },

  init: {
    value: function () {
      var scene = this.el.sceneEl;
      this.setupMouseControls();
      this.setupHMDControls();
      this.attachEventListeners();
      scene.addBehavior(this);
    }
  },

  setupMouseControls: {
    value: function () {
      this.canvasEl = document.querySelector('vr-scene').canvas;
      // The canvas where the scene is painted
      this.mouseDown = false;
      this.pitchObject = new THREE.Object3D();
      this.yawObject = new THREE.Object3D();
      this.yawObject.position.y = 10;
      this.yawObject.add(this.pitchObject);
    }
  },

  setupHMDControls: {
    value: function () {
      this.dolly = new THREE.Object3D();
      this.euler = new THREE.Euler();
      this.controls = new THREE.VRControls(this.dolly);
      this.zeroQuaternion = new THREE.Quaternion();
    }
  },

  attachEventListeners: {
    value: function () {
      var canvasEl = document.querySelector('vr-scene').canvas;
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

  update: {
    value: (function () {
      var hmdEuler = new THREE.Euler();
      hmdEuler.order = 'YXZ';
      return function () {
        var hmdQuaternion;
        var pitchObject = this.pitchObject;
        var yawObject = this.yawObject;
        if (!this.data.enabled) { return; }
        hmdQuaternion = this.updateHMDQuaternion();
        hmdEuler.setFromQuaternion(hmdQuaternion);
        this.el.setAttribute('rotation', {
          x: THREE.Math.radToDeg(hmdEuler.x) + THREE.Math.radToDeg(pitchObject.rotation.x),
          y: THREE.Math.radToDeg(hmdEuler.y) + THREE.Math.radToDeg(yawObject.rotation.y),
          z: THREE.Math.radToDeg(hmdEuler.z)
        });
      };
    })()
  },

  updateHMDQuaternion: {
    value: (function () {
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
    })()
  },

  zeroOrientation: {
    value: function () {
      var euler = new THREE.Euler();
      euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
      // Cancel out roll and pitch. We want to only reset yaw
      euler.z = 0;
      euler.x = 0;
      this.zeroQuaternion.setFromEuler(euler);
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
    }
  },

  onTouchEnd: {
    value: function () {
      this.touchStarted = false;
    }
  }

});
