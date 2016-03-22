var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../registerPrimitive');
var utils = require('../../../utils/');

registerPrimitive('a-torus', utils.extendDeep({}, getMeshMixin(), {
  defaultAttributes: {
    geometry: {
      primitive: 'torus'
    }
  },

  mappings: {
    'radius': 'geometry.radius',
    'radius-tubular': 'geometry.radiusTubular',
    'segments-radial': 'geometry.segmentsRadial',
    'segments-tubular': 'geometry.segmentsTubular',
    'arc': 'geometry.arc'
  }
}));
