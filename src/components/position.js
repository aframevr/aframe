var coordinatesMixin = require('../utils/coordinates').componentMixin;
var registerComponent = require('../core/register-component').registerComponent;
var utils = require('../utils/');

module.exports.Component = registerComponent('position', utils.extend({
  defaults: {
    value: {
      x: 0,
      y: 0,
      z: 0
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
