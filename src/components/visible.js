var registerComponent = require('../core/register-component').registerComponent;

var proto = {
  defaults: {
    value: {
      visible: true
    }
  },

  update: {
    value: function () {
      var object3D = this.el.object3D;
      object3D.visible = this.data.visible;
    }
  },

  parseAttributesString: {
    value: function (attrs) {
      return { visible: attrs === 'true' };
    }
  },

  stringifyAttributes: {
    value: function (attrs) {
      return attrs.visible.toString();
    }
  }
};

module.exports.Component = registerComponent('visible', proto);
