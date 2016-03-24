var registerComponent = require('../../core/component').registerComponent;
var THREE = require('../../lib/three');

var COMPONENT_SUFFIX = '-controls';
var MAX_DELTA = 0.2; // ms
var PI_2 = Math.PI / 2;

/**
 * Universal-controls component.
 *
 * Receives input events from device-specific control components, and applies movement and rotation
 * to the element accordingly.
 */
module.exports.Component = registerComponent('universal-controls', {

  dependencies: ['velocity'],

  schema: {
    enabled: { default: true },

    flyingEnabled: { default: false },

    movementEnabled: { default: true },
    movementControls: { default: ['gamepad', 'wasd', 'touch'] },
    movementEasing: { default: 15 }, // m/s2
    movementAcceleration: { default: 65 }, // m/s2

    rotationEnabled: { default: true },
    rotationControls: { default: ['hmd', 'gamepad', 'mouse'] },
    rotationSensitivity: { default: 0.05 } // radians/frame, ish
  },

  init: function () {
    // Movement
    this.velocity = new THREE.Vector3();

    // Rotation
    this.pitch = new THREE.Object3D();
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.add(this.pitch);
    this.heading = new THREE.Euler(0, 0, 0, 'YXZ');
  },

  tick: function (t, dt) {
    if (isNaN(dt)) { return; }

    // Update rotation.
    if (this.data.rotationEnabled) {
      this.updateRotation(dt);
    }

    // Update velocity. If FPS is too low, reset.
    if (this.data.movementEnabled && dt / 1000 > MAX_DELTA) {
      this.velocity.set(0, 0, 0);
      this.el.setAttribute('velocity', this.velocity);
    } else if (this.data.movementEnabled) {
      this.updateVelocity(dt);
    }
  },

  updateRotation: function (dt) {
    var control, dRotation;
    var data = this.data;

    for (var i = 0, l = data.rotationControls.length; i < l; i++) {
      control = this.el.components[data.rotationControls[i] + COMPONENT_SUFFIX];
      if (control && control.isRotationActive()) {
        if (control.getRotationDelta) {
          dRotation = control.getRotationDelta(dt);
          dRotation.multiplyScalar(data.rotationSensitivity);
          this.yaw.rotation.y -= dRotation.x;
          this.pitch.rotation.x -= dRotation.y;
          this.pitch.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitch.rotation.x));
          this.el.setAttribute('rotation', {
            x: THREE.Math.radToDeg(this.pitch.rotation.x),
            y: THREE.Math.radToDeg(this.yaw.rotation.y),
            z: 0
          });
        } else if (control.getRotation) {
          this.el.setAttribute('rotation', control.getRotation());
        } else {
          throw new Error('Incompatible rotation controls: %s', data.rotationControls[i]);
        }
        break;
      }
    }
  },

  updateVelocity: function (dt) {
    var control, dVelocity;
    var data = this.data;
    var rotation = this.el.getAttribute('rotation');
    var velocity = this.velocity;

    if (this.el.hasAttribute('velocity')) {
      velocity.copy(this.el.getAttribute('velocity'));
    }

    for (var i = 0, l = data.movementControls.length; i < l; i++) {
      control = this.el.components[data.movementControls[i] + COMPONENT_SUFFIX];
      if (control && control.isVelocityActive()) {
        if (control.getVelocityDelta) {
          dVelocity = control.getVelocityDelta(dt);
        } else if (control.getVelocity) {
          throw new Error('getVelocity() not currently supported, use getVelocityDelta()');
        } else {
          throw new Error('Incompatible movement controls: ', data.movementControls[i]);
        }
        break;
      }
    }

    velocity.x -= velocity.x * data.movementEasing * dt / 1000;
    velocity.z -= velocity.z * data.movementEasing * dt / 1000;

    if (dVelocity) {
      // Set acceleration
      if (dVelocity.length() > 1) {
        dVelocity.setLength(this.data.movementAcceleration * dt / 1000);
      } else {
        dVelocity.multiplyScalar(this.data.movementAcceleration * dt / 1000);
      }

      // Rotate to heading
      if (rotation) {
        this.heading.set(
          data.flyingEnabled ? THREE.Math.degToRad(rotation.x) : 0,
          THREE.Math.degToRad(rotation.y),
          0
        );
        dVelocity.applyEuler(this.heading);
      }

      velocity.add(dVelocity);
    }

    this.el.setAttribute('velocity', {x: velocity.x, y: velocity.y, z: velocity.z});
  }
});
