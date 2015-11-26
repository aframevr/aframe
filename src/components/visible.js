var registerComponent = require('../core/register-component').registerComponent;

/**
 * Visibility component.
 *
 * @param {bool}
 */
module.exports.Component = registerComponent('visible', {
  defaults: {
    value: true
  },

  update: {
    value: function () {
      this.el.object3D.visible = this.data;
    }
  },

  parse: {
    value: function (value) {
      return value === 'true';
    }
  },

  stringify: {
    value: function (value) {
      return value.toString();
    }
  }
});
