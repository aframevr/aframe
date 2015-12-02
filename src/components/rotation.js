var coordinatesMixin = require('../utils/coordinates').componentMixin;
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../utils/');

module.exports.Component = registerComponent('rotation', utils.extend({
  schema: {
    x: { default: 0 },
    y: { default: 0 },
    z: { default: 0 }
  },

  /**
   * Updates object3D rotation.
   */
  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;
    object3D.rotation.set(THREE.Math.degToRad(data.x),
                          THREE.Math.degToRad(data.y),
                          THREE.Math.degToRad(data.z));
    object3D.rotation.order = 'YXZ';
  }
}, coordinatesMixin));
