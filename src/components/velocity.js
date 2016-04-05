var registerComponent = require('../core/component').registerComponent;

/**
 * Velocity component.
 *
 * Updates object's position at each tick.
 */
module.exports = registerComponent('velocity', {
  dependencies: ['position'],

  schema: { type: 'vec3' },

  tick: function (t, dt) {
    if (isNaN(dt)) { return; }

    var data = this.data;
    var position = this.el.getComputedAttribute('position');

    this.el.setAttribute('position', {
      x: position.x + data.x * dt / 1000,
      y: position.y + data.y * dt / 1000,
      z: position.z + data.z * dt / 1000
    });
  }
});
