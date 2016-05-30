var registerSystem = require('../core/system').registerSystem;
var controls = require('../core/controls').controls;

/**
 * Initializes the A-Frame controls system.
 */
module.exports.System = registerSystem('controls', {
  init: function () {
    this.controls = [];
  },

  /**
   * Adds an instance of the `controls` component to the system. Only the
   * master `controls` components should be registered (not `*-controls`).
   * @param {ControlsComponent} controls
   */
  addControls: function (controls) {
    this.controls.push(controls);
  },

  /**
   * Removes an instance of the `controls` component from the system.
   * @param  {ControlsComponent} controls
   */
  removeControls: function (controls) {
    this.controls.splice(this.controls.indexOf(controls), 1);
  },

  tick: function (t, dt) {
    var controls = this.controls;
    for (var i = 0; i < controls.length; i++) {
      controls[i].updateControls(t, dt);
    }
  },

  hasPositionControls: function (name) {
    return !!controls.positionControls[name];
  },

  hasRotationControls: function (name) {
    return !!controls.rotationControls[name];
  }
});
