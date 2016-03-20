var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-sphere', utils.extendDeep({}, getMeshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'sphere'
    }
  },

  mappings: {
    radius: 'geometry.radius',
    'segments-height': 'geometry.segmentsHeight',
    'segments-width': 'geometry.segmentsWidth',
    translate: 'geometry.translate'
  }
}));
