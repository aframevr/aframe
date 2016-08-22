var registerComponent = require('../core/component').registerComponent;

/**
 * Visibility component.
 */
module.exports.Component = registerComponent('visible', {
  schema: {default: true},

  update: function () {
    this.el.object3D.visible = this.data;
  }
});
