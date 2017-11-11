var degToRad = require('../lib/three').Math.degToRad;
var registerComponent = require('../core/component').registerComponent;
var utils = require('../utils/');

var defaultRotation = {x: 0, y: 0, z: 0};

var UNIT_DEGREES = 'degrees';
var UNIT_RADIANS = 'radians';

module.exports.Component = registerComponent('rotation', {
  schema: {
    unit: {default: UNIT_DEGREES, oneOf: [UNIT_DEGREES, UNIT_RADIANS]},
    x: {type: 'number'},
    y: {type: 'number'},
    z: {type: 'number'},
    parse: function (val) {
      if (val.constructor === Object) { return val; }
      return utils.coordinates.parse(val, defaultRotation);
    },
    stringify: function (val) {
      return utils.coordinates.stringify(val);
    }
  },

  /**
   * Update object3D rotation.
   */
  update: function () {
    var data = this.data;
    var object3D = this.el.object3D;

    if (data.unit === UNIT_DEGREES) {
      object3D.rotation.set(degToRad(data.x), degToRad(data.y), degToRad(data.z));
    } else {
      object3D.rotation.set(data.x, data.y, data.z);
    }
    object3D.rotation.order = 'YXZ';
  }
});
