var coordinateParser = require('../utils/coordinate-parser');
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../utils/');

var proto = {
  defaults: {
    value: {
      x: 0,
      y: 0,
      z: 0
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
};

utils.extend(proto, coordinateParser);
module.exports.Component = registerComponent('rotation', proto);
