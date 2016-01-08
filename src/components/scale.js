var coordinatesMixin = require('../utils/coordinates').componentMixin;
var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

// Avoids triggering a zero-determinant which makes object3D matrix non-invertible.
var zeroScale = 0.00001;

module.exports.Component = registerComponent('scale', utils.extend({
  schema: {
    x: { default: 1 },
    y: { default: 1 },
    z: { default: 1 }
  },

  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    var x = data.x === 0 ? zeroScale : data.x;
    var y = data.y === 0 ? zeroScale : data.y;
    var z = data.z === 0 ? zeroScale : data.z;
    object3D.scale.set(x, y, z);
  }
}, coordinatesMixin));
