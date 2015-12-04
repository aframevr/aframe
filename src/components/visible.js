var registerComponent = require('../core/register-component').registerComponent;

/**
 * Visibility component.
 *
 * @param {bool}
 */
module.exports.Component = registerComponent('visible', {
  schema: {
    value: { default: true }
  },

  update: {
    value: function () {
      this.el.object3D.visible = this.data;
    }
  },

  parse: {
    value: function (value) {
      return value !== 'false';
    }
  },

  stringify: {
    value: function (value) {
      return value.toString();
    }
  }
});
