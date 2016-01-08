var registerComponent = require('../core/component').registerComponent;

/**
 * Visibility component.
 *
 * @param {bool}
 */
module.exports.Component = registerComponent('visible', {
  schema: { default: true },

  update: function () {
    this.el.object3D.visible = this.data;
  },

  parse: function (value) {
    return value !== 'false';
  },

  stringify: function (value) {
    return value.toString();
  }
});
