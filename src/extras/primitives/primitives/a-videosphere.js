var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-videosphere', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 5000,
      segmentsWidth: 64,
      segmentsHeight: 32
    },
    material: {
      color: '#FFF',
      shader: 'flat',
      npot: true
    },
    scale: '-1 1 1'
  },

  mappings: {
    radius: 'geometry.radius',
    'segments-height': 'geometry.segmentsHeight',
    'segments-width': 'geometry.segmentsWidth'
  }
}));
