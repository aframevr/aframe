var coordinateParser = require('../utils/coordinate-parser');
var registerComponent = require('../core/register-component').registerComponent;
var utils = require('../vr-utils');

var proto = {
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
      // Updates three.js object
      object3D.position.set(data.x, data.y, data.z);
    }
  }
};

utils.extend(proto, coordinateParser);
module.exports.Component = registerComponent('position', proto);
