let getMeshMixin = require('../getMeshMixin');
let registerPrimitive = require('../primitives').registerPrimitive;
let utils = require('../../../utils/');

registerPrimitive('a-videosphere', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 500,
      segmentsWidth: 64,
      segmentsHeight: 32
    },
    material: {
      color: '#FFF',
      shader: 'flat',
      side: 'back',
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
