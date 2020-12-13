let registerComponent = require('../core/component').registerComponent;

// Avoids triggering a zero-determinant which makes object3D matrix non-invertible.
let zeroScale = 0.00001;

module.exports.Component = registerComponent('scale', {
  schema: {
    type: 'vec3',
    default: {x: 1, y: 1, z: 1}
  },

  update: function () {
    let data = this.data;
    let object3D = this.el.object3D;
    let x = data.x === 0 ? zeroScale : data.x;
    let y = data.y === 0 ? zeroScale : data.y;
    let z = data.z === 0 ? zeroScale : data.z;
    object3D.scale.set(x, y, z);
  },

  remove: function () {
    // Pretty much for mixins.
    this.el.object3D.scale.set(1, 1, 1);
  }
});
