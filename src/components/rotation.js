var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('rotation', {
  defaults: {
    value: {
      x: 0,
      y: 0,
      z: 0
    }
  },

  update: {
    value: function () {
      var data = this.data;
      var object3D = this.el.object3D;
      // Updates three.js object
      var rotationX = THREE.Math.degToRad(data.x);
      var rotationY = THREE.Math.degToRad(data.y);
      var rotationZ = THREE.Math.degToRad(data.z);
      // Updates three.js object
      object3D.rotation.set(rotationX, rotationY, rotationZ);
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
