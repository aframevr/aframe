var registerComponent = require('../core/register-component').registerComponent;

module.exports.Component = registerComponent('scale', {
  defaults: {
    value: {
      x: 1,
      y: 1,
      z: 1
    }
  },

  update: {
    value: function () {
      var data = this.data;
      var object3D = this.el.object3D;
      object3D.scale.set(data.x, data.y, data.z);
    }
  },

  parseAttributesString: {
    value: function (attrs) {
      var defaults = this.defaults;
      if (typeof attrs !== 'string') { return attrs; }
      var values = attrs.split(' ');
      return {
        x: parseFloat(values[0] || defaults.x),
        y: parseFloat(values[1] || defaults.y),
        z: parseFloat(values[2] || defaults.z)
      };
    }
  },

  stringifyAttributes: {
    value: function (attrs) {
      if (typeof attrs !== 'object') { return attrs; }
      return [attrs.x, attrs.y, attrs.z].join(' ');
    }
  }
});
