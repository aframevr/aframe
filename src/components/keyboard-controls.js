var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('keyboard-controls', {
  defaults: {
    value: {
      easing: 20,
      acceleration: 65,
      enabled: true,
      fly: false
    }
  },

  init: {
    value: function () {
      this.setupControls();
    }
  },

  setupControls: {
    value: function () {
      var scene = this.el.sceneEl;
      this.prevTime = Date.now();
      // To keep track of the pressed keys
      this.keys = {};
      this.velocity = new THREE.Vector3();
      this.attachEventListeners();
      scene.addBehavior(this);
    }
  },

  update: {
    value: function () {
      var data = this.data;
      var acceleration = data.acceleration;
      var easing = data.easing;
      var velocity = this.velocity;
      var time = window.performance.now();
      var delta = (time - this.prevTime) / 1000;
      var keys = this.keys;
      var movementVector;
      var el = this.el;
      this.prevTime = time;

      velocity.x -= velocity.x * easing * delta;
      velocity.z -= velocity.z * easing * delta;

      var position = el.getComputedAttribute('position');

      if (this.data.enabled) {
        if (keys[65]) { velocity.x -= acceleration * delta; } // Left
        if (keys[68]) { velocity.x += acceleration * delta; } // Right
        if (keys[87]) { velocity.z -= acceleration * delta; } // Up
        if (keys[83]) { velocity.z += acceleration * delta; } // Down
      }

      movementVector = this.getMovementVector(delta);
      el.object3D.translateX(movementVector.x);
      el.object3D.translateY(movementVector.y);
      el.object3D.translateZ(movementVector.z);

      el.setAttribute('position', {
        x: position.x + movementVector.x,
        y: position.y + movementVector.y,
        z: position.z + movementVector.z
      });
    }
  },

  attachEventListeners: {
    value: function () {
      // Keyboard events
      window.addEventListener('keydown', this.onKeyDown.bind(this), false);
      window.addEventListener('keyup', this.onKeyUp.bind(this), false);
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
    value: (function (delta) {
      var direction = new THREE.Vector3(0, 0, 0);
      var rotation = new THREE.Euler(0, 0, 0, 'YXZ');
      return function (delta) {
        var object3D = this.el.object3D;
        var velocity = this.velocity;
        direction.copy(velocity).multiplyScalar(delta);
        if (!this.data.fly) { return direction; }
        direction.applyEuler(rotation);
        rotation.set(object3D.rotation.x, object3D.rotation.y, 0);
        return direction;
      };
    })()
  }
});
