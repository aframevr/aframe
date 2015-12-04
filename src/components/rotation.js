var coordinatesMixin = require('../utils/coordinates').componentMixin;
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../utils/');

module.exports.Component = registerComponent('rotation', utils.extend({
  schema: {
    value: {
      x: { default: 0 },
      y: { default: 0 },
      z: { default: 0 }
    }
  },

  /**
   * Updates object3D rotation.
   */
  update: {
    value: function () {
      var data = this.data;
      var object3D = this.el.object3D;
      object3D.rotation.set(THREE.Math.degToRad(data.x),
                            THREE.Math.degToRad(data.y),
                            THREE.Math.degToRad(data.z));
      object3D.rotation.order = 'YXZ';
    }
  }
}, coordinatesMixin));
