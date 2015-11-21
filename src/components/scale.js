var coordinateParser = require('../utils/coordinate-parser');
var registerComponent = require('../core/register-component').registerComponent;
var utils = require('../utils/');

// To avoid triggering a 0 determinat
// wich makes the object3D matrix non invertible
var zeroScale = 0.000000000001;

var proto = {
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
      var x = data.x === 0 ? zeroScale : data.x;
      var y = data.y === 0 ? zeroScale : data.y;
      var z = data.z === 0 ? zeroScale : data.z;
      object3D.scale.set(x, y, z);
    }
  }
};

utils.extend(proto, coordinateParser);
module.exports.Component = registerComponent('scale', proto);
