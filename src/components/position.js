var coordinatesMixin = require('../utils/coordinates').componentMixin;
var registerComponent = require('../core/register-component').registerComponent;
var utils = require('../utils/');

module.exports.Component = registerComponent('position', utils.extend({
  schema: {
    value: {
      x: { default: 0 },
      y: { default: 0 },
      z: { default: 0 }
    }
  },

  update: {
    value: function () {
      var object3D = this.el.object3D;
      var data = this.data;
      object3D.position.set(data.x, data.y, data.z);
    }
  }
}, coordinatesMixin));
