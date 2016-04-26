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
  dependencies: ['velocity'],

  schema: {
    enabled: { default: true },

    flyingEnabled: { default: false },

    position: {
      default: ['hmd-controls', 'gamepad-controls', 'touch-controls']
    },
    positionControlsEnabled: { default: true },
    positionEasing: { default: 15 }, // m/s2
    positionAcceleration: { default: 65 }, // m/s2

    rotation: { default: ['hmd-controls', 'gamepad-controls', 'mouse-controls'] },
    rotationEnabled: { default: true }
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

  update: function (previousData) {
    // Re-validate if scene has loaded. If not, listener was already bound in init().
    if (!this.el.sceneEl.hasLoaded) { return; }
    this.validateControls();
  },

  tick: function (t, dt) {
    var data = this.data;
    var velocity = this.velocity;

    if (isNaN(dt)) { return; }

    // Update rotation.
    if (data.rotationEnabled) {
      this.updateRotation(dt);
    }

    // Update velocity. If FPS is too low, reset.
    if (data.positionControlsEnabled && dt / 1000 > MAX_DELTA) {
      velocity.set(0, 0, 0);
      this.el.setAttribute('velocity', velocity);
    } else {
      this.updateVelocity(dt);
    }
  },

  /**
   * Updates rotation based on input from the active rotation component, if any.
   * @param  {number} dt
   */
  updateRotation: function (dt) {
    var rotation;
    var dRotation;
    var el = this.el;
    var yaw = this.yaw;
    var pitch = this.pitch;
    var control = this.getActiveRotationControls();
    if (control && control.getRotationDelta) {
      dRotation = control.getRotationDelta(dt);
      yaw.rotation.y -= dRotation.x;
      pitch.rotation.x -= dRotation.y;
      pitch.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitch.rotation.x));
      el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(pitch.rotation.x),
        y: THREE.Math.radToDeg(yaw.rotation.y),
        z: 0
      });
    } else if (control) {
      rotation = control.getRotation();
      el.setAttribute('rotation', rotation);
      yaw.rotation.y = THREE.Math.degToRad(rotation.y);
      pitch.rotation.x = THREE.Math.degToRad(rotation.x);
      pitch.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitch.rotation.x));
    }
  },

  /**
   * Updates velocity based on input from the active position component, if any.
   * @param {number} dt
   */
  updateVelocity: function (dt) {
    var control;
    var el = this.el;
    var data = this.data;
    var velocity = this.velocity;

    if (el.hasAttribute('velocity')) {
      velocity.copy(el.getComputedAttribute('velocity'));
    }

    velocity.x -= velocity.x * data.positionEasing * dt / 1000;
    velocity.z -= velocity.z * data.positionEasing * dt / 1000;

    control = data.positionControlsEnabled ? this.getActivePositionControls() : null;
    if (control && control.getVelocityDelta) {
      this.applyVelocityDelta(dt, control.getVelocityDelta(dt));
    } else if (control) {
      velocity.copy(control.getVelocity(dt));
    }

    el.setAttribute('velocity', {x: velocity.x, y: velocity.y, z: velocity.z});
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
      dVelocity.setLength(this.data.positionAcceleration * dt / 1000);
    } else {
      dVelocity.multiplyScalar(this.data.positionAcceleration * dt / 1000);
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
   * Validates position and rotation controls, asserting that each was registered with
   * AFRAME.registerControls.
   * @return {[type]} [description]
   */
  validateControls: function () {
    var i;
    var name;
    var el = this.el;
    var data = this.data;
    var system = this.system;
    var missingControls = [];

    for (i = 0; i < data.position.length; i++) {
      name = data.position[i];
      if (!system.hasPositionControls(name)) {
        throw new Error('Component `' + name + '` must be ' +
                        'registered with AFRAME.registerControls().');
      } else if (!el.components[name]) {
        missingControls.push(name);
      }
    }

    for (i = 0; i < data.rotation.length; i++) {
      name = data.rotation[i];
      if (!system.hasRotationControls(name)) {
        throw new Error('Component `' + name + '` must be ' +
                        'registered with AFRAME.registerControls().');
      } else if (!el.components[name]) {
        missingControls.push(name);
      }
    }

    // Inject any missing controls components.
    for (i = 0; i < missingControls.length; i++) {
      el.setAttribute(missingControls[i], '');
    }
  },

  /**
   * Returns the first active position controls component, if any.
   * @return {ControlsComponent}
   */
  getActivePositionControls: function () {
    var control;
    var names = this.data.position;
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
