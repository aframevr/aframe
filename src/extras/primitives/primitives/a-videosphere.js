var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-videosphere', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 100,
      segmentsWidth: 64,
      segmentsHeight: 20
    },
    material: {
      color: '#FFF',
      shader: 'flat'
    },
    scale: '-1 1 1'
  },

  mappings: {
    radius: 'geometry.radius',
    'segments-height': 'geometry.segmentsHeight',
    'segments-width': 'geometry.segmentsWidth'
  }
}));
