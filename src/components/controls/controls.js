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

    if (this.el.sceneEl.hasLoaded) {
      this.validateControls();
    } else {
      this.el.sceneEl.addEventListener('loaded', this.validateControls.bind(this));
    }
  },

  update: function () {
    // Re-validate if scene has loaded. If not, listener was already bound in init().
    if (this.el.sceneEl.hasLoaded) {
      this.validateControls();
    }
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

  /**
   * Updates rotation based on input from the active rotation component, if any.
   * @param  {number} dt
   */
  updateRotation: function (dt) {
    var control, dRotation;
    var data = this.data;

    control = this.getActiveRotationControls();
    if (control && control.getRotationDelta) {
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
    } else if (control) {
      this.el.setAttribute('rotation', control.getRotation());
    }
  },

  /**
   * Updates velocity based on input from the active movement component, if any.
   * @param {number} dt
   */
  updateVelocity: function (dt) {
    var control;
    var data = this.data;

    if (this.el.hasAttribute('velocity')) {
      this.velocity.copy(this.el.getAttribute('velocity'));
    }

    this.velocity.x -= this.velocity.x * data.movementEasing * dt / 1000;
    this.velocity.z -= this.velocity.z * data.movementEasing * dt / 1000;

    control = this.getActiveMovementControls();
    if (control && control.getVelocityDelta) {
      this.applyVelocityDelta(dt, control.getVelocityDelta(dt));
    } else if (control) {
      throw new Error('getVelocity() not currently supported, use getVelocityDelta().');
    }

    this.el.setAttribute('velocity', {x: this.velocity.x, y: this.velocity.y, z: this.velocity.z});
  },

  /**
   * Updates internal velocity. Takes a velocity delta (relative to current heading), rotates it
   * to the heading, and calculates velocity in world space.
   * @param {number} dt
   * @param {THREE.Vector3} dVelocity
   */
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
  },

  /**
   * Validates movement and rotation controls, asserting that each was registered with
   * AFRAME.registerControls.
   * @return {[type]} [description]
   */
  validateControls: function () {
    var i, name;
    var data = this.data;
    var system = this.system;
    var missingControls = [];

    for (i = 0; i < data.movement.length; i++) {
      name = data.movement[i];
      if (!system.movementControls[name]) {
        throw new Error('Component `' + name + '` must be ' +
                        'registered with AFRAME.registerControls().');
      } else if (!this.el.components[name]) {
        missingControls.push(name);
      }
    }

    for (i = 0; i < data.rotation.length; i++) {
      name = data.rotation[i];
      if (!system.rotationControls[name]) {
        throw new Error('Component `' + name + '` must be ' +
                        'registered with AFRAME.registerControls().');
      } else if (!this.el.components[name]) {
        missingControls.push(name);
      }
    }

    // Inject any missing controls components.
    for (i = 0; i < missingControls.length; i++) {
      this.el.setAttribute(missingControls[i], '');
    }
  },

  /**
   * Returns the first active movement controls component, if any.
   * @return {ControlsComponent}
   */
  getActiveMovementControls: function () {
    var control;
    var names = this.data.movement;
    for (var i = 0; i < names.length; i++) {
      control = this.el.components[names[i]];
      if (control && control.isVelocityActive()) {
        return control;
      }
    }
    return null;
  },

  /**
   * Returns the first active rotation controls component, if any.
   * @return {ControlsComponent}
   */
  getActiveRotationControls: function () {
    var control;
    var names = this.data.rotation;
    for (var i = 0; i < names.length; i++) {
      control = this.el.components[names[i]];
      if (control && control.isRotationActive()) {
        return control;
      }
    }
    return null;
  }
});
