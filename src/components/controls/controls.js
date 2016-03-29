var registerControls = require('../../core/controls').registerControls;
var THREE = require('../../lib/three');

var MAX_DELTA = 0.2; // ms
var PI_2 = Math.PI / 2;

/**
 * Controls component.
 *
 * Receives input events from device-specific control components, and applies movement and rotation
 * to the element accordingly.
 */
module.exports.Component = registerControls('controls', {

  dependencies: ['velocity', 'rotation'],

  schema: {
    enabled: { default: true },

    flyingEnabled: { default: false },

    movement: { default: ['gamepad-controls', 'wasd-controls', 'touch-controls'] },
    movementEnabled: { default: true },
    movementEasing: { default: 15 }, // m/s2
    movementAcceleration: { default: 65 }, // m/s2

    rotation: { default: ['hmd-controls', 'gamepad-controls', 'mouse-controls'] },
    rotationEnabled: { default: true },
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

    for (var i = 0, l = data.rotation.length; i < l; i++) {
      if (!this.system.rotationControls[data.rotation[i]]) {
        throw new Error('Unregistered rotation controls: `' + data.rotation[i] + '`.');
      }

      control = this.el.components[data.rotation[i]];
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
          throw new Error('Incompatible rotation controls: %s', data.rotation[i]);
        }
        break;
      }
    }
  },

  updateVelocity: function (dt) {
    var control;
    var data = this.data;

    if (this.el.hasAttribute('velocity')) {
      this.velocity.copy(this.el.getAttribute('velocity'));
    }

    this.velocity.x -= this.velocity.x * data.movementEasing * dt / 1000;
    this.velocity.z -= this.velocity.z * data.movementEasing * dt / 1000;

    for (var i = 0, l = data.movement.length; i < l; i++) {
      if (!this.system.movementControls[data.movement[i]]) {
        throw new Error('Unregistered movement controls: `' + data.movement[i] + '`.');
      }

      control = this.el.components[data.movement[i]];
      if (control && control.isVelocityActive()) {
        if (control.getVelocityDelta) {
          this.applyVelocityDelta(dt, control.getVelocityDelta(dt));
        } else if (control.getVelocity) {
          throw new Error('getVelocity() not currently supported, use getVelocityDelta().');
        } else {
          throw new Error('Incompatible movement controls: `' + data.movement[i] + '`.');
        }
        break;
      }
    }

    this.el.setAttribute('velocity', {x: this.velocity.x, y: this.velocity.y, z: this.velocity.z});
  },

  applyVelocityDelta: function (dt, dVelocity) {
    var data = this.data;
    var rotation = this.el.getAttribute('rotation');

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

    this.velocity.add(dVelocity);
  }
});
